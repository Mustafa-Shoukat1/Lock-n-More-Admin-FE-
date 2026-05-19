-- Step 1: Add Helper Columns to Session Tables

-- WhatsApp Sessions
ALTER TABLE whatsapp_sessions
ADD COLUMN IF NOT EXISTS last_customer_message_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS awaiting_agent_reply BOOLEAN DEFAULT FALSE;

-- Instagram Sessions
ALTER TABLE instagram_sessions
ADD COLUMN IF NOT EXISTS last_customer_message_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS awaiting_agent_reply BOOLEAN DEFAULT FALSE;

-- Step 2: Create Performance Metrics Table
CREATE TABLE IF NOT EXISTS agent_response_metrics (
    id SERIAL PRIMARY KEY,
    platform VARCHAR NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'tiktok')),
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    inbound_message_id INTEGER NOT NULL,
    outbound_message_id INTEGER NOT NULL,
    response_time_ms BIGINT NOT NULL,
    inbound_at TIMESTAMP NOT NULL,
    replied_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_response_user ON agent_response_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_response_created ON agent_response_metrics(created_at);

-- Step 3: Create Agent Performance View
CREATE OR REPLACE VIEW agent_performance_view AS
SELECT
    arm.user_id,
    u.name as agent_name,
    COUNT(*) AS total_responses,
    AVG(response_time_ms) AS avg_response_time_ms,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) AS median_response_time_ms,
    COUNT(*) FILTER (WHERE response_time_ms <= 300000) * 100.0 / NULLIF(COUNT(*), 0) AS sla_percentage
FROM agent_response_metrics arm
JOIN users u ON u.id = arm.user_id
WHERE u.role != 'super_admin'
GROUP BY arm.user_id, u.name;
