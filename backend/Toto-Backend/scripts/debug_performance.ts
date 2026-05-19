import pool from '../src/config/db.config';

async function debugPerformance() {
    try {
        console.log('--- Debugging Performance Metrics ---');

        // 1. Check User Role for ID 3
        const userRes = await pool.query('SELECT id, name, email, role FROM users WHERE id = 3');
        if (userRes.rows.length === 0) {
            console.log('User 3 not found');
        } else {
            console.log('User 3 Details:', userRes.rows[0]);
        }

        // 2. Check WhatsApp Sessions for User 3
        console.log('\n--- WhatsApp Sessions for User 3 (Active) ---');
        const waSessions = await pool.query(`
            SELECT id, 
                   contact_phone, 
                   assigned_user_id, 
                   awaiting_agent_reply, 
                   last_customer_message_at 
            FROM whatsapp_sessions 
            WHERE assigned_user_id = 3
        `);
        console.table(waSessions.rows);

        // 3. Check Metrics Table
        console.log('\n--- Agent Response Metrics (Last 10) ---');
        // Corrected column name to replied_at
        const metrics = await pool.query('SELECT * FROM agent_response_metrics ORDER BY replied_at DESC LIMIT 10');
        console.table(metrics.rows);

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await pool.end();
    }
}

debugPerformance();
