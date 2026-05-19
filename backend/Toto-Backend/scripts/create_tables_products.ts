
import pool from '../src/config/db.config';

const createTables = async () => {
    try {
        console.log('🔄 Creating product tables...');

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Products Table
            await client.query(`
                CREATE TABLE IF NOT EXISTS products (
                    shopify_id BIGINT PRIMARY KEY,
                    title TEXT,
                    vendor TEXT,
                    product_type TEXT,
                    handle TEXT,
                    status TEXT,
                    total_inventory INT,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP,
                    published_at TIMESTAMP,
                    tags TEXT
                );
            `);
            console.log('✅ Created table: products');

            // 2. Product Chunks Table (for body_html split)
            await client.query(`
                CREATE TABLE IF NOT EXISTS product_chunks (
                    id SERIAL PRIMARY KEY,
                    product_id BIGINT REFERENCES products(shopify_id) ON DELETE CASCADE,
                    chunk_index INT NOT NULL,
                    chunk_content TEXT NOT NULL
                );
            `);
            console.log('✅ Created table: product_chunks');

            // 3. Product Images Table
            await client.query(`
                CREATE TABLE IF NOT EXISTS product_images (
                    id BIGINT PRIMARY KEY, -- Shopify Image ID
                    product_id BIGINT REFERENCES products(shopify_id) ON DELETE CASCADE,
                    image_url TEXT NOT NULL,
                    position INT,
                    width INT,
                    height INT,
                    alt TEXT
                );
            `);
            console.log('✅ Created table: product_images');

            await client.query('COMMIT');
            console.log('🚀 All tables created successfully.');
        } catch (err: any) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('❌ Table creation failed:', error.message);
    } finally {
        await pool.end();
    }
};

createTables();
