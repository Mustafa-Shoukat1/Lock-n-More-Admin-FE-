-- Follow-up automation tracking and configuration

-- Follow-up schedule table
CREATE TABLE IF NOT EXISTS followup_schedules (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- whatsapp, instagram, tiktok
    session_id VARCHAR(255) NOT NULL,
    contact_id VARCHAR(255) NOT NULL,
    delay_minutes INT DEFAULT 120, -- default 2 hours
    is_enabled BOOLEAN DEFAULT TRUE,
    scheduled_at TIMESTAMP DEFAULT NOW(),
    last_sent_at TIMESTAMP,
    next_send_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(platform, session_id)
);

-- Follow-up message template table
CREATE TABLE IF NOT EXISTS followup_templates (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    message_text TEXT NOT NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up audit log
CREATE TABLE IF NOT EXISTS followup_audit (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    scheduled_id INT REFERENCES followup_schedules(id) ON DELETE CASCADE,
    action VARCHAR(50), -- 'scheduled', 'sent', 'cancelled', 'failed'
    status_message TEXT,
    attempted_at TIMESTAMP DEFAULT NOW()
);

-- Seed default follow-up templates
INSERT INTO followup_templates (platform, message_text, is_active) VALUES
('whatsapp', 'Hey! We haven''t heard back from you. Any thoughts on our previous message?', TRUE),
('instagram', 'Hey! We haven''t heard back from you. Any thoughts on our previous message?', TRUE),
('tiktok', 'Hey! We haven''t heard back from you. Any thoughts on our previous message?', TRUE)
ON CONFLICT DO NOTHING;

-- Create index for scheduler queries
CREATE INDEX IF NOT EXISTS idx_followup_schedules_next_send ON followup_schedules(next_send_at) WHERE is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_followup_schedules_platform ON followup_schedules(platform, is_enabled);
