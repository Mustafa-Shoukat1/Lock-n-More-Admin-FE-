-- TikTok Contacts Table
CREATE TABLE IF NOT EXISTS tiktok_contacts (
    id VARCHAR(255) PRIMARY KEY, -- open_id
    username VARCHAR(255),
    name VARCHAR(255),
    profile_pic_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TikTok Sessions Table (Conversation Window)
CREATE TABLE IF NOT EXISTS tiktok_sessions (
    id SERIAL PRIMARY KEY,
    contact_id VARCHAR(255) REFERENCES tiktok_contacts(id),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed'
    assigned_user_id INTEGER REFERENCES users(id),
    is_ai_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    awaiting_agent_reply BOOLEAN DEFAULT FALSE,
    last_customer_message_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TikTok Messages Table
CREATE TABLE IF NOT EXISTS tiktok_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES tiktok_sessions(id),
    tiktok_open_id VARCHAR(255) REFERENCES tiktok_contacts(id),
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TikTok Message Payloads Table (Specific Content)
CREATE TABLE IF NOT EXISTS tiktok_message_payloads (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES tiktok_messages(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    media_url TEXT,
    media_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
