import { Pool } from 'pg';

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_s2rQHEku8ngq@ep-frosty-glitter-a16bbe5j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

async function verifyFix() {
    try {
        console.log('--- Verifying Response Time Fix ---');

        // 1. Create a dummy session or use existing one
        const sessionPhone = 'test_' + (Date.now() % 1000000);
        await pool.query('INSERT INTO contacts (phone, name) VALUES ($1, $2) ON CONFLICT (phone) DO NOTHING', [sessionPhone, 'Test User']);
        await pool.query('INSERT INTO whatsapp_sessions (contact_phone) VALUES ($1)', [sessionPhone]);

        const sessionRes = await pool.query('SELECT id FROM whatsapp_sessions WHERE contact_phone = $1', [sessionPhone]);
        const sessionId = sessionRes.rows[0].id;
        console.log('Created test session:', sessionId);

        // 2. Set last_customer_message_at to 10 seconds ago
        const tenSecondsAgo = new Date(Date.now() - 10000);
        await pool.query('UPDATE whatsapp_sessions SET last_customer_message_at = $1, awaiting_agent_reply = TRUE, assigned_user_id = 1 WHERE id = $2', [tenSecondsAgo, sessionId]);

        // 3. Simulate agent response (manual calculation to replicate whatsapp.service.ts logic)
        const updatedSessionRes = await pool.query('SELECT last_customer_message_at FROM whatsapp_sessions WHERE id = $1', [sessionId]);
        const inboundAt = new Date(updatedSessionRes.rows[0].last_customer_message_at);
        const repliedAt = new Date();
        const diffMs = repliedAt.getTime() - inboundAt.getTime();

        console.log('Inbound At (from DB):', inboundAt.toISOString());
        console.log('Replied At (now):', repliedAt.toISOString());
        console.log('Calculated Difference (ms):', diffMs);

        if (diffMs >= 9000 && diffMs <= 11000) {
            console.log('✅ SUCCESS: Response time calculation is accurate (approx 10s).');
        } else if (diffMs > 18000000) {
            console.log('❌ FAILURE: Response time still has 5-hour offset (approx 300m).');
        } else {
            console.log('⚠️ UNCERTAIN: Difference is ' + diffMs + 'ms. Expected around 10000ms.');
        }

        // Cleanup
        await pool.query('DELETE FROM whatsapp_sessions WHERE id = $1', [sessionId]);
        console.log('Cleaned up test session.');

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await pool.end();
    }
}

verifyFix();
