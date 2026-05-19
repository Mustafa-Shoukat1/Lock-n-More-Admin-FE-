
import pool from '../src/config/db.config';

const countProducts = async () => {
    try {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT COUNT(*) FROM products');
            console.log(`Total products in DB: ${res.rows[0].count}`);

            const resChunks = await client.query('SELECT COUNT(*) FROM product_chunks');
            console.log(`Total product_chunks in DB: ${resChunks.rows[0].count}`);

            // Also get the min and max ID to see range
            const range = await client.query('SELECT MIN(shopify_id), MAX(shopify_id) FROM products');
            console.log(`Min Product ID: ${range.rows[0].min}`);
            console.log(`Max Product ID: ${range.rows[0].max}`);

        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

countProducts();
