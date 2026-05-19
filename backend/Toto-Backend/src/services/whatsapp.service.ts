import axios from 'axios';
import fs from 'fs';
import path from 'path';
import pool from '../config/db.config';

import { MediaUploadService } from './mediaUpload.service';

export class WhatsAppService {
    private apiUrl: string;
    private accessToken: string;
    private phoneNumberId: string;
    private mediaUploadService: MediaUploadService;

    constructor() {
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        this.apiUrl = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;
        this.mediaUploadService = new MediaUploadService();
    }

    async getMediaStream(mediaId: string) {
        try {
            // Step 1: Get the media URL
            const urlResponse = await axios.get(`https://graph.facebook.com/v22.0/${mediaId}`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });

            const mediaUrl = urlResponse.data.url;
            if (!mediaUrl) throw new Error('Failed to get media URL from Meta');

            // Step 2: Fetch the binary data as stream
            const mediaResponse = await axios.get(mediaUrl, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
                responseType: 'stream'
            });

            return {
                stream: mediaResponse.data,
                mimeType: mediaResponse.headers['content-type'],
                fileSize: mediaResponse.headers['content-length']
            };
        } catch (error: any) {
            console.error('Error fetching media stream from Meta:', error.response?.data || error.message);
            throw new Error('Failed to fetch media stream from WhatsApp');
        }
    }

    async processIncomingMedia(mediaId: string, mediaType: string, sessionId: string) {
        try {
            console.log(`🔄 Processing media ${mediaId} for session ${sessionId}...`);
            const { stream, mimeType, fileSize } = await this.getMediaStream(mediaId);

            console.log(`📤 Uploading to Spaces (${mimeType}, size: ${fileSize})...`);

            // Convert fileSize to number safely if it's a string
            const size = fileSize ? parseInt(String(fileSize), 10) : undefined;
            const safeMimeType = typeof mimeType === 'string' ? mimeType : 'application/octet-stream';
            const publicUrl = await this.mediaUploadService.uploadMedia(stream, safeMimeType, sessionId, mediaType, size);

            console.log(`✅ Media uploaded: ${publicUrl}`);
            return {
                mediaUrl: publicUrl,
                mimeType,
                size: size
            };
        } catch (error: any) {
            console.error('Error processing incoming media:', error.message);
            // Fallback? Or just throw? Required to persist media, so throw.
            throw error;
        }
    }

    async getMedia(mediaId: string) {
        try {
            // Step 1: Get the media URL
            const urlResponse = await axios.get(`https://graph.facebook.com/v22.0/${mediaId}`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });

            const mediaUrl = urlResponse.data.url;
            if (!mediaUrl) throw new Error('Failed to get media URL from Meta');

            // Step 2: Fetch the binary data
            const mediaResponse = await axios.get(mediaUrl, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
                responseType: 'arraybuffer'
            });

            return {
                data: mediaResponse.data,
                mimeType: mediaResponse.headers['content-type']
            };
        } catch (error: any) {
            console.error('Error fetching media from Meta:', error.response?.data || error.message);
            throw new Error('Failed to fetch media from WhatsApp');
        }
    }

    async getOrCreateContact(phone: string, name?: string) {
        try {
            const query = `
                INSERT INTO contacts (phone, name)
                VALUES ($1, $2)
                ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
                RETURNING *
            `;
            const result = await pool.query(query, [phone, name || phone]);
            return result.rows[0];
        } catch (error: any) {
            console.error('Error in getOrCreateContact:', error.message);
            throw error;
        }
    }

    async getOrCreateSession(phone: string) {
        try {
            // Check for an existing open session
            const checkQuery = `
                SELECT * FROM whatsapp_sessions 
                WHERE contact_phone = $1 AND status = 'open'
                ORDER BY created_at DESC LIMIT 1
            `;
            const checkResult = await pool.query(checkQuery, [phone]);

            if (checkResult.rows.length > 0) {
                return checkResult.rows[0];
            }

            // Create new session if no open one exists
            const insertQuery = `
                INSERT INTO whatsapp_sessions (contact_phone)
                VALUES ($1)
                RETURNING *
            `;
            const insertResult = await pool.query(insertQuery, [phone]);
            return insertResult.rows[0];
        } catch (error: any) {
            console.error('Error in getOrCreateSession:', error.message);
            throw error;
        }
    }

    async isSessionOpen(phone: string): Promise<boolean> {
        try {
            const session = await this.getOrCreateSession(phone);

            if (session.status !== 'open') return false;

            const now = new Date();
            const lastActivity = new Date(session.last_activity_at);
            const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

            return diffHours <= 24;
        } catch (error: any) {
            console.error('Error checking session status:', error.message);
            return false;
        }
    }

    async getSessionData(phone: string) {
        try {
            const session = await this.getOrCreateSession(phone);

            const now = new Date();
            const lastActivity = new Date(session.last_activity_at);
            const expiresAt = new Date(lastActivity.getTime() + 24 * 60 * 60 * 1000);
            const isOpen = session.status === 'open' && now.getTime() <= expiresAt.getTime();

            return {
                session_id: session.id,
                is_open: isOpen,
                is_ai_active: session.is_ai_active,
                assigned_user_id: session.assigned_user_id,
                expires_at: expiresAt.toISOString(),
                last_activity_at: lastActivity.toISOString()
            };
        } catch (error: any) {
            console.error('Error fetching session data:', error.message);
            throw new Error('Failed to fetch session data');
        }
    }

    async markSessionAsAwaitingReply(sessionId: string) {
        try {
            // Check if assigned user exists and is NOT super_admin
            const checkQuery = `
                SELECT u.role 
                FROM whatsapp_sessions s
                JOIN users u ON s.assigned_user_id = u.id
                WHERE s.id = $1
            `;
            const result = await pool.query(checkQuery, [sessionId]);

            if (result.rows.length > 0) {
                const role = result.rows[0].role;
                if (role !== 'super_admin') {
                    await pool.query(`
                        UPDATE whatsapp_sessions 
                        SET last_customer_message_at = NOW(), awaiting_agent_reply = TRUE 
                        WHERE id = $1
                     `, [sessionId]);
                }
            }
        } catch (error: any) {
            console.error('Error marking session as awaiting reply:', error.message);
        }
    }

    async logAgentResponse(sessionId: string, userId: number, role: string, outboundMessageId: number, inboundMessageId?: number) {
        try {
            if (role === 'super_admin') return;

            // Fetch session to check flags
            const sessionResult = await pool.query(`SELECT * FROM whatsapp_sessions WHERE id = $1`, [sessionId]);
            const session = sessionResult.rows[0];

            if (session && session.awaiting_agent_reply && session.assigned_user_id === userId) {
                const inboundAt = new Date(session.last_customer_message_at);
                const repliedAt = new Date();
                const diffMs = repliedAt.getTime() - inboundAt.getTime();

                // If inboundMessageId not provided, fetch last inbound
                let finalInboundId = inboundMessageId;
                if (!finalInboundId) {
                    const lastInbound = await pool.query(`SELECT id FROM messages WHERE session_id = $1 AND direction = 'inbound' ORDER BY created_at DESC LIMIT 1`, [sessionId]);
                    finalInboundId = lastInbound.rows[0]?.id;
                }

                if (finalInboundId) {
                    await pool.query(`
                        INSERT INTO agent_response_metrics 
                        (platform, session_id, user_id, inbound_message_id, outbound_message_id, response_time_ms, inbound_at, replied_at)
                        VALUES ('whatsapp', $1, $2, $3, $4, $5, $6, $7)
                     `, [sessionId, userId, finalInboundId, outboundMessageId, diffMs, inboundAt, repliedAt]);

                    await pool.query(`
                        UPDATE whatsapp_sessions 
                        SET awaiting_agent_reply = FALSE, last_customer_message_at = NULL 
                        WHERE id = $1
                     `, [sessionId]);

                    if ((global as any).io) {
                        (global as any).io.emit("agent_performance_updated", { userId });
                    }
                }
            }
        } catch (error: any) {
            console.error('Error logging agent response:', error.message);
        }
    }

    async sendImage(to: string, imageUrl?: string, mediaId?: string, caption?: string, userId?: number, role?: string) {
        try {
            const sessionData = await this.getSessionData(to);

            if (!sessionData.is_open) {
                throw new Error('Cannot send image: 24h Session is closed. Send a template first.');
            }

            const data: any = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'image',
                image: mediaId ? { id: mediaId, caption } : { link: imageUrl, caption }
            };

            const response = await axios.post(this.apiUrl, data, {
                headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' }
            });

            // Save to DB
            const savedMsg = await this.saveMessage(to, 'outbound', 'image',
                { text: caption || 'Image Message' },
                {
                    session_id: sessionData.session_id,
                    media_url: imageUrl || undefined,
                    media_id: mediaId || undefined
                }
            );

            // Log Performance
            if (userId && role) {
                this.logAgentResponse(sessionData.session_id, userId, role, savedMsg.id);
            }

            return response.data;
        } catch (error: any) {
            console.error('Error sending WhatsApp image:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.error_data?.details || error.response?.data?.error?.message || 'Failed to send image');
        }
    }

    async sendAudio(to: string, audioUrl?: string, mediaId?: string, userId?: number, role?: string) {
        try {
            const sessionData = await this.getSessionData(to);

            if (!sessionData.is_open) {
                throw new Error('Cannot send audio: 24h Session is closed. Send a template first.');
            }

            const data: any = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'audio',
                audio: mediaId ? { id: mediaId } : { link: audioUrl }
            };

            const response = await axios.post(this.apiUrl, data, {
                headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' }
            });

            // Save to DB
            const savedMsg = await this.saveMessage(to, 'outbound', 'audio',
                { text: 'Audio Message' },
                {
                    session_id: sessionData.session_id,
                    media_url: audioUrl || undefined,
                    media_id: mediaId || undefined
                }
            );

            // Log Performance
            if (userId && role) {
                this.logAgentResponse(sessionData.session_id, userId, role, savedMsg.id);
            }

            return response.data;
        } catch (error: any) {
            console.error('Error sending WhatsApp audio:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.error_data?.details || error.response?.data?.error?.message || 'Failed to send audio');
        }
    }

    async sendVideo(to: string, videoUrl?: string, mediaId?: string, caption?: string, userId?: number, role?: string) {
        try {
            const sessionData = await this.getSessionData(to);

            if (!sessionData.is_open) {
                throw new Error('Cannot send video: 24h Session is closed. Send a template first.');
            }

            console.log(`📤 Sending WhatsApp video to ${to}. URL: ${videoUrl}, MediaID: ${mediaId}`);

            const cleanUrl = videoUrl ? encodeURI(videoUrl.trim()) : undefined;

            const data: any = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'video',
                video: mediaId ? { id: mediaId, caption } : { link: cleanUrl, caption }
            };

            const response = await axios.post(this.apiUrl, data, {
                headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' }
            });

            // Save to DB
            const savedMsg = await this.saveMessage(to, 'outbound', 'video',
                { text: caption || 'Video Message' },
                {
                    session_id: sessionData.session_id,
                    media_url: videoUrl || undefined,
                    media_id: mediaId || undefined
                }
            );

            // Log Performance
            if (userId && role) {
                this.logAgentResponse(sessionData.session_id, userId, role, savedMsg.id);
            }

            return response.data;
        } catch (error: any) {
            console.error('Error sending WhatsApp video:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.error_data?.details || error.response?.data?.error?.message || 'Failed to send video');
        }
    }

    async sendMessage(to: string, templateName?: string, languageCode: string = 'en', message?: string, variables?: string[], userId?: number, role?: string) {
        try {
            const sessionData = await this.getSessionData(to);
            let finalTemplateName = templateName;
            let finalMessage = message;
            let finalVariables = variables;
            let forceTemplate = false;

            if (!sessionData.is_open && !templateName) {
                console.log(`⚠️ Session closed for ${to}. Automatically sending reopen_session template.`);
                forceTemplate = true;
                finalTemplateName = 'reopen_session';
                finalVariables = ['Nouman'];
                finalMessage = undefined;
            }

            if (sessionData.is_open && finalMessage) {
                finalTemplateName = undefined;
                finalVariables = undefined;
            }

            let data: any = { messaging_product: 'whatsapp', to: to };

            if (finalTemplateName || forceTemplate) {
                data.type = 'template';
                data.template = {
                    name: finalTemplateName,
                    language: { code: languageCode }
                };
                if (finalVariables && finalVariables.length > 0) {
                    data.template.components = [
                        {
                            type: 'body',
                            parameters: finalVariables.map(variable => ({ type: 'text', text: variable }))
                        }
                    ];
                }
            } else if (finalMessage) {
                data.type = 'text';
                data.text = { body: finalMessage };
            } else {
                throw new Error('Either message or templateName must be provided');
            }

            const response = await axios.post(this.apiUrl, data, {
                headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' }
            });

            // Save outgoing message to DB
            const textToSave = finalMessage || finalTemplateName || 'Template Message';
            const savedMsg = await this.saveMessage(to, 'outbound', finalTemplateName ? 'template' : 'text', { text: textToSave }, { session_id: sessionData.session_id });

            // Log Performance (Only for text messages or explicit agent replies, not auto templates often)
            // But if agent sends a template, it counts? Yes.
            if (userId && role) {
                this.logAgentResponse(sessionData.session_id, userId, role, savedMsg.id);
            }

            return {
                ...response.data,
                session_refresh_needed: forceTemplate,
                session_status: sessionData.is_open ? 'OPEN' : 'CLOSED'
            };
        } catch (error: any) {
            console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.error_data?.details || error.response?.data?.error?.message || 'Failed to send message');
        }
    }


    async getMessages(phone: string, limit: number = 20, before?: string) {
        try {
            let query = `
                SELECT m.id, m.session_id, m.phone, m.direction, m.type, m.is_read, m.created_at,
                       p.content, p.media_url, p.media_id
                FROM messages m
                JOIN message_payloads p ON m.id = p.message_id
                WHERE m.phone = $1
            `;
            const params: any[] = [phone];

            if (before) {
                query += ` AND m.created_at < $2`;
                params.push(before);
            }

            query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
            params.push(limit);

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error: any) {
            console.error('Error fetching messages from DB:', error.message);
            return [];
        }
    }

    async getContacts() {
        try {
            const query = `SELECT * FROM contacts ORDER BY name ASC`;
            const result = await pool.query(query);
            return result.rows;
        } catch (error: any) {
            console.error('Error fetching contacts:', error.message);
            return [];
        }
    }

    async saveMessage(phone: string, direction: 'inbound' | 'outbound', type: 'text' | 'template' | 'image' | 'audio' | 'video', content: any, metadata?: { media_url?: string | null | undefined, media_id?: string | null | undefined, session_id?: string }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get session
            let sessionId = metadata?.session_id;
            if (!sessionId) {
                const session = await this.getOrCreateSession(phone);
                sessionId = session.id;
            }

            // 1. Insert Metadata
            const metaQuery = `
                INSERT INTO messages (session_id, phone, direction, type)
                VALUES ($1, $2, $3, $4)
                RETURNING id, created_at
            `;
            const metaResult = await client.query(metaQuery, [sessionId, phone, direction, type]);
            const messageId = metaResult.rows[0].id;

            // 2. Insert Payload
            const payloadQuery = `
                INSERT INTO message_payloads (message_id, content, media_url, media_id)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(payloadQuery, [
                messageId,
                content,
                metadata?.media_url || null,
                metadata?.media_id || null
            ]);

            await client.query('COMMIT');
            console.log(`✅ Message saved (Split): ${phone} - ${direction}`);

            if (direction === 'inbound') {
                // Ensure sessionId is valid
                await this.markSessionAsAwaitingReply(String(sessionId));

                // trigger notification
                try {
                    const notificationService = new (require('./notification.service').NotificationService)();
                    await notificationService.createNotification({
                        type: 'message',
                        title: `New WhatsApp Message`,
                        message: `From ${phone}: ${type === 'text' ? (content as any).text : '[' + type + ']'}`,
                        link: `/chat/whatsapp/${phone}`,
                        conversation_id: String(sessionId)
                    });
                } catch (notifError: any) {
                    console.error('Failed to create notification for WhatsApp message:', notifError.message);
                }
            }

            return {
                ...metaResult.rows[0],
                phone,
                direction,
                type,
                content
            };
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error saving message (Split):', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async markMessagesAsRead(phone: string) {
        try {
            const query = `
                UPDATE messages 
                SET is_read = TRUE 
                WHERE phone = $1 AND direction = 'inbound' AND is_read = FALSE
                RETURNING *
            `;
            const result = await pool.query(query, [phone]);
            return result.rowCount;
        } catch (error: any) {
            console.error('Error marking messages as read:', error.message);
            throw error;
        }
    }

    async getConversations(userId?: number, role?: string) {
        try {
            let query = `
                SELECT DISTINCT ON (s.contact_phone)
                    s.id as session_id,
                    s.contact_phone as phone,
                    c.name as contact_name,
                    s.assigned_user_id,
                    m.type,
                    m.created_at,
                    p.content,
                    m.direction
                FROM whatsapp_sessions s
                JOIN contacts c ON s.contact_phone = c.phone
                LEFT JOIN messages m ON s.id = m.session_id
                LEFT JOIN message_payloads p ON m.id = p.message_id
                WHERE s.status = 'open' AND s.is_archived = FALSE
            `;
            const params: any[] = [];

            // Filter logic
            if (role && role !== 'super_admin' && role !== 'admin' && userId) {
                // Agents see assigned chats ONLY
                query += ` AND s.assigned_user_id = $1`;
                params.push(userId);
            }

            query += ` ORDER BY s.contact_phone, m.created_at DESC`;

            const result = await pool.query(query, params);

            return result.rows.map(row => ({
                id: row.session_id,
                participant: {
                    name: row.contact_name || row.phone,
                    phone: row.phone
                },
                assigned_user_id: row.assigned_user_id,
                lastMessage: {
                    text: row.content?.text || (row.type && row.type !== 'text' ? `[${row.type}]` : 'No messages'),
                    created_at: row.created_at,
                    isFromUser: row.direction === 'inbound'
                },
                unreadCount: 0
            }));
        } catch (error: any) {
            console.error('Error fetching conversations:', error.message);
            return [];
        }
    }

    async assignSession(phone: string, userId: number | null) {
        try {
            const query = `
                UPDATE whatsapp_sessions
                SET assigned_user_id = $1
                WHERE contact_phone = $2
                RETURNING *
            `;
            const result = await pool.query(query, [userId, phone]);
            const session = result.rows[0];

            // If assigning to a user (and not unassigning)
            if (userId && session) {
                // Check user role
                const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
                const role = userRes.rows[0]?.role;

                if (role && role !== 'super_admin') {
                    // Check if last message was from customer (inbound)
                    const lastMsgRes = await pool.query(`
                        SELECT direction, created_at 
                        FROM messages 
                        WHERE session_id = $1 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    `, [session.id]);

                    const lastMsg = lastMsgRes.rows[0];

                    if (lastMsg && lastMsg.direction === 'inbound') {
                        console.log(`📝 Session assigned to agent. Last msg was inbound. valid for tracking.`);
                        await this.markSessionAsAwaitingReply(session.id);
                        // We might want to set last_customer_message_at to the ACTUAL message time, 
                        // but markSessionAsAwaitingReply sets it to NOW(). 
                        // Let's stick with NOW() as the "start of assignment timer" or use message time?
                        // If we use message time, the agent might be penalized for time before assignment.
                        // Ideally, SLAs should start from assignment time for the agent.
                        // BUT `markSessionAsAwaitingReply` sets it to NOW().
                        // Let's override it to NOW() (which markSessionAsAwaitingReply does) so the timer starts when they get the ticket.
                    }
                }
            }

            return session;
        } catch (error: any) {
            console.error('Error assigning session:', error.message);
            throw error;
        }
    }

    async archiveConversation(sessionId: string, isArchived: boolean) {
        try {
            const query = `
                UPDATE whatsapp_sessions 
                SET is_archived = $1 
                WHERE id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [isArchived, sessionId]);
            return result.rows[0];
        } catch (error: any) {
            console.error('Error archiving conversation:', error.message);
            throw error;
        }
    }

    async archiveSessionByPhone(phone: string, isArchived: boolean) {
        try {
            // Archive ALL open or active sessions for this phone, or just the latest?
            // Usually we want to archive the current interaction.
            // Let's update any session for this phone.
            const query = `
                UPDATE whatsapp_sessions
                SET is_archived = $1
                WHERE contact_phone = $2
                RETURNING *
            `;
            const result = await pool.query(query, [isArchived, phone]);
            return result.rows;
        } catch (error: any) {
            console.error('Error archiving session by phone:', error.message);
            throw error;
        }
    }
    async UpdateSessionForAI(sessionId: string, is_ai_active: boolean) {
        try {
            const query = `UPDATE whatsapp_sessions 
                         SET is_ai_active = $1 
                         WHERE id = $2
                         RETURNING * `
            const result = await pool.query(query, [is_ai_active, sessionId]);
            return result.rows[0];
        } catch (error: any) {
            console.error('Error archiving conversation:', error.message);
            throw error;
        }
    }
}

