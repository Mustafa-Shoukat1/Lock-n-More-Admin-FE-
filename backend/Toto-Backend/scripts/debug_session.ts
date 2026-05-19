import pool from '../src/config/db.config';

async function debugSessionState() {
    try {
        console.log('--- Debugging Session State ---');
        const phone = '923151710347';

        const res = await pool.query(`
            SELECT id, 
                   contact_phone, 
                   assigned_user_id, 
                   awaiting_agent_reply, 
                   last_customer_message_at 
            FROM whatsapp_sessions 
            WHERE contact_phone = $1
        `, [phone]);

        console.table(res.rows);

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await pool.end();
    }
}

debugSessionState();
