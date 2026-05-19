-- Instagram Contacts
CREATE TABLE IF NOT EXISTS instagram_contacts (
    id VARCHAR(255) PRIMARY KEY, -- Instagram Scoped User ID (IGSID)
    username VARCHAR(255),
    name VARCHAR(255),
    profile_pic_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Instagram Sessions
CREATE TABLE IF NOT EXISTS instagram_sessions (
    id SERIAL PRIMARY KEY,
    contact_id VARCHAR(255) NOT NULL REFERENCES instagram_contacts(id),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_ai_active BOOLEAN DEFAULT TRUE,
    assigned_user_id INTEGER, -- References users table if exists
    is_archived BOOLEAN DEFAULT FALSE
);

-- Instagram Messages
CREATE TABLE IF NOT EXISTS instagram_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES instagram_sessions(id),
    instagram_id VARCHAR(255) NOT NULL, -- Sender or Recipient ID
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'audio', 'template', 'reaction'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Instagram Message Payloads
CREATE TABLE IF NOT EXISTS instagram_message_payloads (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES instagram_messages(id) ON DELETE CASCADE,
    content JSONB, -- Stores text, caption, or other metadata
    media_url TEXT,
    media_id VARCHAR(255)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_instagram_sessions_contact_id ON instagram_sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_instagram_sessions_status ON instagram_sessions(status);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_session_id ON instagram_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_instagram_id ON instagram_messages(instagram_id);
