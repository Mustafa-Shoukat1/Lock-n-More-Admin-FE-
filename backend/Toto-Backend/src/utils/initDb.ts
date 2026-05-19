import pool from '../config/db.config';

export const initDb = async () => {
    const client = await pool.connect();
    try {
        console.log('Initializing database...');

        await client.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            DO $$ BEGIN
                CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                CREATE TYPE message_type AS ENUM ('text', 'template', 'image', 'audio', 'video');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                CREATE TYPE session_status AS ENUM ('open', 'closed', 'archived');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'admin', 'super_admin')),
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            -- DROP legacy tables to force schema update
            -- (Commenting out to PREVENT data loss on restart)
            -- DROP TABLE IF EXISTS message_payloads CASCADE;
            -- DROP TABLE IF EXISTS messages CASCADE;
            -- DROP TABLE IF EXISTS whatsapp_sessions CASCADE;

            CREATE TABLE IF NOT EXISTS contacts (
                phone VARCHAR(20) PRIMARY KEY,
                name VARCHAR(255),
                is_Archived BOOLEAN DEFAULT FALSE,
                profile_pic_url TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS whatsapp_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                contact_phone VARCHAR(20) NOT NULL REFERENCES contacts(phone) ON DELETE CASCADE,
                assigned_user_id INT REFERENCES users(id) ON DELETE SET NULL,
                is_ai_active BOOLEAN DEFAULT TRUE,
                is_archived BOOLEAN DEFAULT FALSE,
                status session_status DEFAULT 'open',
                last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            -- Metadata Table (Hot Storage)
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
                phone VARCHAR(20) NOT NULL REFERENCES contacts(phone) ON DELETE CASCADE,
                direction message_direction NOT NULL,
                type message_type NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            -- Content Table (Cold/Warm Storage)
            CREATE TABLE IF NOT EXISTS message_payloads (
                message_id UUID PRIMARY KEY REFERENCES messages(id) ON DELETE CASCADE,
                content JSONB NOT NULL,
                media_url TEXT,
                media_id TEXT
            );

            -- Trigger for updating session last_activity_at
            CREATE OR REPLACE FUNCTION update_session_activity()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE whatsapp_sessions 
                SET last_activity_at = NEW.created_at 
                WHERE id = NEW.session_id;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS trg_update_session_activity ON messages;
            CREATE TRIGGER trg_update_session_activity
            AFTER INSERT ON messages
            FOR EACH ROW
            EXECUTE FUNCTION update_session_activity();

            -- Indexes for massive scale
            CREATE INDEX IF NOT EXISTS idx_messages_session_created_at ON messages (session_id, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_messages_phone_created_at ON messages (phone, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_sessions_contact ON whatsapp_sessions (contact_phone, status);

            -- AI Settings Table
            -- DROP TABLE IF EXISTS ai_settings; -- (Uncomment if you need to reset the table)
            CREATE TABLE IF NOT EXISTS ai_settings (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                prompt TEXT NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed AI Settings
        const settingsCount = await client.query('SELECT COUNT(*) FROM ai_settings');
        if (parseInt(settingsCount.rows[0].count) === 0) {
            console.log('Seeding AI Settings...');
            const defaultSettings = [
                {
                    name: 'Professional',
                    prompt: 'You are a professional assistant. Maintain a formal and respectful tone in all responses. Be concise and to the point.',
                    description: 'Formal and respectful tone.',
                    is_active: true
                },
                {
                    name: 'Friendly',
                    prompt: 'You are a friendly and approachable assistant. Use conversational language and emojis where appropriate to make the user feel welcome.',
                    description: 'Casual and welcoming tone.',
                    is_active: false
                },
                {
                    name: 'Concise',
                    prompt: 'You are a concise assistant. Provide short, direct answers without unnecessary elaboration. Focus on efficiency.',
                    description: 'Short and direct responses.',
                    is_active: false
                },
                {
                    name: 'Detailed',
                    prompt: 'You are a detailed assistant. Provide comprehensive explanations and include all relevant information. unanticipated questions.',
                    description: 'Thorough and explanatory responses.',
                    is_active: false
                }
            ];

            for (const setting of defaultSettings) {
                await client.query(
                    'INSERT INTO ai_settings (name, prompt, description, is_active) VALUES ($1, $2, $3, $4)',
                    [setting.name, setting.prompt, setting.description, setting.is_active]
                );
            }
            console.log('✅ Seeded default AI settings.');
        }

        // Seed contacts from JSON if table is empty
        const countResult = await client.query('SELECT COUNT(*) FROM contacts');
        if (parseInt(countResult.rows[0].count) === 0) {
            console.log('Seeding contacts from JSON...');
            try {
                const fs = require('fs');
                const path = require('path');
                const contactsPath = path.join(__dirname, '../../data/contacts.json');
                if (fs.existsSync(contactsPath)) {
                    const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));
                    for (const contact of contacts) {
                        await client.query(
                            'INSERT INTO contacts (phone, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                            [contact.phone, contact.name]
                        );
                    }
                    console.log(`✅ Seeded ${contacts.length} contacts.`);
                }
            } catch (seedError) {
                console.error('Error seeding contacts:', seedError);
            }
        }

        console.log('Database initialized successfully: users and messages tables checked/created.');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
};
