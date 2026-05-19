import { ShopifyClient } from '../clients/shopify.client';
import { logger } from '../utils/logger';
import pool from '../config/db.config';

export class ShopifyService {
    private client: ShopifyClient;

    constructor() {
        this.client = new ShopifyClient();
    }

    /**
     * Pings the Shopify store to verify connectivity.
     * Fetches basic shop information.
     */
    async pingShop() {
        try {
            const restClient = this.client.getClient();
            // Fetch shop details
            const shopResponse = await restClient.get({
                path: 'shop',
            });

            // Fetch all products
            let allProducts: any[] = [];
            let productsResponse = await restClient.get({
                path: 'products',
                query: { limit: 250 } // Max limit per page
            });

            allProducts = [...allProducts, ...(productsResponse.body.products as any[])];

            // Handle pagination
            while (productsResponse.pageInfo?.nextPage) {
                logger.info('Fetching next page of products...');
                productsResponse = await restClient.get({
                    path: 'products',
                    query: productsResponse.pageInfo.nextPage.query
                });
                allProducts = [...allProducts, ...(productsResponse.body.products as any[])];
            }

            logger.info(`Successfully fetched total ${allProducts.length} products`);

            // Fetch collections (smart and custom)
            const smartCollResponse = await restClient.get({
                path: 'smart_collections',
            });
            const customCollResponse = await restClient.get({
                path: 'custom_collections',
            });

            const collections = [
                ...(smartCollResponse.body.smart_collections as any[]),
                ...(customCollResponse.body.custom_collections as any[])
            ];

            logger.info('Successfully fetched Shopify shop, products, and collections');

            const productsWithInventory = allProducts.map((product: any) => {
                const totalInventory = product.variants.reduce((sum: number, variant: any) => {
                    return sum + (variant.inventory_quantity || 0);
                }, 0);
                return {
                    ...product,
                    total_inventory: totalInventory
                };
            });

            return {
                shop: shopResponse.body.shop,
                products: productsWithInventory,
                collections: collections
            };
        } catch (error: any) {
            logger.error('Failed to fetch Shopify data', error);
            throw new Error(`Shopify connection failed: ${error.message}`);
        }
    }

    /**
     * Upserts a batch of Shopify products into the local database.
     * Handles chunking of body_html and replacing images.
     */
    async syncProducts(products: any[]) {
        const client = await pool.connect();
        try {
            logger.info(`Starting sync for ${products.length} products...`);
            await client.query('BEGIN');

            // 0. Remove current products completely
            logger.info('Clearing current products and related data for full refresh...');
            await client.query('DELETE FROM product_variants');
            await client.query('DELETE FROM product_images');
            await client.query('DELETE FROM product_chunks');
            await client.query('DELETE FROM products');

            // 1. Prepare bulk data
            const productRows: any = {
                ids: [], titles: [], vendors: [], types: [], handles: [], statuses: [], 
                inventories: [], created: [], updated: [], published: [], tags: []
            };
            const chunkRows: any = { prodIds: [], indices: [], contents: [] };
            const imageRows: any = { ids: [], prodIds: [], urls: [], positions: [], widths: [], heights: [], alts: [] };
            const variantRows: any = { ids: [], prodIds: [], titles: [], prices: [], skus: [], inventories: [], defaults: [] };

            for (const p of products) {
                const totalInventory = p.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0;
                
                productRows.ids.push(p.id);
                productRows.titles.push(p.title);
                productRows.vendors.push(p.vendor);
                productRows.types.push(p.product_type);
                productRows.handles.push(p.handle);
                productRows.statuses.push(p.status);
                productRows.inventories.push(totalInventory);
                productRows.created.push(p.created_at);
                productRows.updated.push(p.updated_at);
                productRows.published.push(p.published_at);
                productRows.tags.push(p.tags);

                if (p.body_html) {
                    const chunkSize = 500;
                    for (let i = 0, idx = 0; i < p.body_html.length; i += chunkSize, idx++) {
                        chunkRows.prodIds.push(p.id);
                        chunkRows.indices.push(idx);
                        chunkRows.contents.push(p.body_html.substring(i, i + chunkSize));
                    }
                }

                if (p.images?.length) {
                    for (const img of p.images) {
                        imageRows.ids.push(img.id);
                        imageRows.prodIds.push(p.id);
                        imageRows.urls.push(img.src);
                        imageRows.positions.push(img.position);
                        imageRows.widths.push(img.width);
                        imageRows.heights.push(img.height);
                        imageRows.alts.push(img.alt);
                    }
                }

                if (p.variants?.length) {
                    for (let i = 0; i < p.variants.length; i++) {
                        const v = p.variants[i];
                        variantRows.ids.push(v.id);
                        variantRows.prodIds.push(p.id);
                        variantRows.titles.push(v.title);
                        variantRows.prices.push(parseFloat(v.price) || 0);
                        variantRows.skus.push(v.sku || null);
                        variantRows.inventories.push(v.inventory_quantity || 0);
                        variantRows.defaults.push(i === 0);
                    }
                }
            }

            // 2. Execute Bulk Inserts
            logger.info('Executing bulk inserts...');
            
            if (productRows.ids.length > 0) {
                await client.query(`
                    INSERT INTO products (shopify_id, title, vendor, product_type, handle, status, total_inventory, created_at, updated_at, published_at, tags)
                    SELECT * FROM UNNEST($1::bigint[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::int[], $8::timestamp[], $9::timestamp[], $10::timestamp[], $11::text[])
                `, [
                    productRows.ids, productRows.titles, productRows.vendors, productRows.types, productRows.handles, 
                    productRows.statuses, productRows.inventories, productRows.created, productRows.updated, productRows.published, productRows.tags
                ]);
            }

            if (chunkRows.prodIds.length > 0) {
                await client.query(`
                    INSERT INTO product_chunks (product_id, chunk_index, chunk_content)
                    SELECT * FROM UNNEST($1::bigint[], $2::int[], $3::text[])
                `, [chunkRows.prodIds, chunkRows.indices, chunkRows.contents]);
            }

            if (imageRows.ids.length > 0) {
                await client.query(`
                    INSERT INTO product_images (id, product_id, image_url, position, width, height, alt)
                    SELECT * FROM UNNEST($1::bigint[], $2::bigint[], $3::text[], $4::int[], $5::int[], $6::int[], $7::text[])
                    ON CONFLICT (id) DO NOTHING
                `, [imageRows.ids, imageRows.prodIds, imageRows.urls, imageRows.positions, imageRows.widths, imageRows.heights, imageRows.alts]);
            }

            if (variantRows.ids.length > 0) {
                await client.query(`
                    INSERT INTO product_variants (id, product_id, title, price, sku, inventory_quantity, is_default)
                    SELECT * FROM UNNEST($1::bigint[], $2::bigint[], $3::text[], $4::decimal[], $5::text[], $6::int[], $7::boolean[])
                    ON CONFLICT (id) DO NOTHING
                `, [variantRows.ids, variantRows.prodIds, variantRows.titles, variantRows.prices, variantRows.skus, variantRows.inventories, variantRows.defaults]);
            }

            await client.query('COMMIT');
            logger.info('✅ Successfully synced products batch (Bulk).');
            return { success: true, count: products.length };
        } catch (error: any) {
            await client.query('ROLLBACK');
            logger.error('Error syncing products:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Fetches all products stored in the local database.
     */
    async getStoredProducts() {
        try {
            // Fetch products with their variants and images
            const result = await pool.query(`
                SELECT 
                    p.shopify_id as id,
                    p.title,
                    p.product_type,
                    p.total_inventory,
                    (
                        SELECT json_agg(json_build_object(
                            'id', v.id,
                            'title', v.title,
                            'price', v.price,
                            'sku', v.sku,
                            'inventory_quantity', v.inventory_quantity
                        ))
                        FROM product_variants v
                        WHERE v.product_id = p.shopify_id
                    ) as variants,
                    (
                        SELECT json_agg(json_build_object(
                            'id', img.id,
                            'src', img.image_url
                        ))
                        FROM product_images img
                        WHERE img.product_id = p.shopify_id
                    ) as images
                FROM products p
                ORDER BY p.updated_at DESC
            `);

            return result.rows;
        } catch (error) {
            logger.error('Error fetching stored products:', error);
            throw error;
        }
    }

    /**
     * Creates an order in Shopify after successful payment.
     */
    async createOrder(params: { variantId: number; quantity: number; customerIdentifier: string; note?: string }) {
        const { variantId, quantity, customerIdentifier, note } = params;
        try {
            const restClient = this.client.getClient();
            const response = await restClient.post({
                path: 'orders',
                data: {
                    order: {
                        line_items: [
                            {
                                variant_id: variantId,
                                quantity: quantity
                            }
                        ],
                        customer: {
                            // In a real scenario, you'd look up or create a Shopify customer
                            // For now, we attach the user identifier in the note or tags
                            note: `Platform User ID: ${customerIdentifier}`
                        },
                        note: note || 'Order created via TOTO Platform',
                        financial_status: 'paid', // Mark as paid since Stripe confirmed it
                        inventory_behaviour: 'decrement_ignoring_policy' // Ensure stock is reduced
                    }
                }
            });

            logger.info(`Shopify Order created: ${response.body.order.id}`);
            return response.body.order;
        } catch (error: any) {
            logger.error('Error creating Shopify order:', error.response?.data || error.message);
            throw new Error(`Failed to sync order to Shopify: ${error.message}`);
        }
    }
}
