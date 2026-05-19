import axios from 'axios';
import pool from '../config/db.config';
import { MediaUploadService } from './mediaUpload.service';

export class InstagramService {
    private apiUrl: string;
    private accessToken: string;
    private accountId: string; // Instagram Professional Account ID
    private mediaUploadService: MediaUploadService;

    constructor() {
        this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
        this.accountId = process.env.INSTAGRAM_ACCOUNT_ID || '';
        // Instagram API with Instagram Login uses graph.instagram.com with IGAAL tokens
        this.apiUrl = `https://graph.instagram.com/v22.0/me/messages`;
        this.mediaUploadService = new MediaUploadService();
    }

    async getMedia(mediaId: string) {
        try {
            // Step 1: Get the media URL
            const urlResponse = await axios.get(`https://graph.instagram.com/v22.0/${mediaId}`, {
                params: { access_token: this.accessToken, fields: 'media_url,media_type' }
            });

            const mediaUrl = urlResponse.data.media_url;
            if (!mediaUrl) throw new Error('Failed to get media URL from Instagram');

            // Step 2: Fetch the binary data
            const mediaResponse = await axios.get(mediaUrl, {
                responseType: 'arraybuffer'
            });

            return {
                data: mediaResponse.data,
                mimeType: mediaResponse.headers['content-type']
            };
        } catch (error: any) {
            console.error('Error fetching media from Instagram:', error.response?.data || error.message);
            throw new Error('Failed to fetch media from Instagram');
        }
    }

    async getMediaStream(mediaId: string) {
        try {
            // Step 1: Get the media URL
            const urlResponse = await axios.get(`https://graph.instagram.com/v22.0/${mediaId}`, {
                params: { access_token: this.accessToken, fields: 'media_url,media_type' }
            });

            const mediaUrl = urlResponse.data.media_url;
            if (!mediaUrl) throw new Error('Failed to get media URL from Instagram');

            // Step 2: Fetch the binary data as stream
            const mediaResponse = await axios.get(mediaUrl, {
                responseType: 'stream'
            });

            return {
                stream: mediaResponse.data,
                mimeType: mediaResponse.headers['content-type'],
                fileSize: mediaResponse.headers['content-length']
            };
        } catch (error: any) {
            console.error('Error fetching media stream from Instagram:', error.response?.data || error.message);
            throw new Error('Failed to fetch media stream from Instagram');
        }
    }

    async processIncomingMedia(mediaId: string, mediaType: string, sessionId: number) {
        try {
            console.log(`🔄 Processing Instagram media ${mediaId} for session ${sessionId}...`);
            // Note: Instagram often provides the media URL directly in the webhook for some types,
            // but fetching via ID is safer if the URL is temporary or if we only get ID.
            // However, unlike WhatsApp, Instagram webhooks might behave differently.
            // We will assume standard Graph API behavior: get URL from ID.

            const { stream, mimeType, fileSize } = await this.getMediaStream(mediaId);

            console.log(`📤 Uploading to Spaces (${mimeType}, size: ${fileSize})...`);
            const size = fileSize ? parseInt(String(fileSize), 10) : undefined;
            const safeMimeType = typeof mimeType === 'string' ? mimeType : 'application/octet-stream';

            // Re-use MediaUploadService (sessionId is string in service but number in DB, ensure type compatibility)
            const publicUrl = await this.mediaUploadService.uploadMedia(stream, safeMimeType, String(sessionId), mediaType, size);

            console.log(`✅ Media uploaded: ${publicUrl}`);
            return {
                mediaUrl: publicUrl,
                mimeType,
                size: size
            };
        } catch (error: any) {
            console.error('Error processing incoming Instagram media:', error.message);
            throw error;
        }
    }

    async getOrCreateContact(instagramId: string, username?: string, name?: string, profilePic?: string) {
        try {
            // Check if contact exists
            const checkQuery = `SELECT * FROM instagram_contacts WHERE id = $1`;
            const checkResult = await pool.query(checkQuery, [instagramId]);

            if (checkResult.rows.length > 0) {
                // Update info if provided
                if (username || name || profilePic) {
                    const updateQuery = `
                        UPDATE instagram_contacts 
                        SET username = COALESCE($2, username),
                            name = COALESCE($3, name),
                            profile_pic_url = COALESCE($4, profile_pic_url),
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1
                        RETURNING *
                    `;
                    const updateResult = await pool.query(updateQuery, [instagramId, username, name, profilePic]);
                    return updateResult.rows[0];
                }
                return checkResult.rows[0];
            }

            // Create new contact
            const insertQuery = `
                INSERT INTO instagram_contacts (id, username, name, profile_pic_url)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const insertResult = await pool.query(insertQuery, [instagramId, username || instagramId, name || '', profilePic || '']);
            return insertResult.rows[0];
        } catch (error: any) {
            console.error('Error in getOrCreateContact (Instagram):', error.message);
            throw error;
        }
    }

    async getOrCreateSession(contactId: string) {
        try {
            // Check for an existing open session
            const checkQuery = `
                SELECT * FROM instagram_sessions 
                WHERE contact_id = $1 AND status = 'open'
                ORDER BY created_at DESC LIMIT 1
            `;
            const checkResult = await pool.query(checkQuery, [contactId]);

            if (checkResult.rows.length > 0) {
                return checkResult.rows[0];
            }

            // Create new session if no open one exists
            const insertQuery = `
                INSERT INTO instagram_sessions (contact_id)
                VALUES ($1)
                RETURNING *
            `;
            const insertResult = await pool.query(insertQuery, [contactId]);
            return insertResult.rows[0];
        } catch (error: any) {
            console.error('Error in getOrCreateSession (Instagram):', error.message);
            throw error;
        }
    }

    async updateSessionActivity(sessionId: number) {
        try {
            await pool.query(
                `UPDATE instagram_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [sessionId]
            );
        } catch (error: any) {
            console.error('Error updating session activity:', error.message);
        }
    }

    async uploadMediaToS3(buffer: Buffer, mimeType: string, sessionId: string, mediaType: string, size?: number) {
        return this.mediaUploadService.uploadMedia(buffer, mimeType, sessionId, mediaType, size);
    }

    async getSessionData(contactId: string) {
        try {
            const session = await this.getOrCreateSession(contactId);

            // Instagram specific logic for session expiry? 
            // Standard messaging window is 24h for human agent tag, 7 days for generic?
            // Let's stick to 24h logic to be safe and consistent with WhatsApp
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
            console.error('Error fetching session data (Instagram):', error.message);
            throw new Error('Failed to fetch session data');
        }
    }

    async markSessionAsAwaitingReply(sessionId: number) {
        try {
            const checkQuery = `
                SELECT u.role 
                FROM instagram_sessions s
                JOIN users u ON s.assigned_user_id = u.id
                WHERE s.id = $1
            `;
            const result = await pool.query(checkQuery, [sessionId]);

            if (result.rows.length > 0) {
                const role = result.rows[0].role;
                if (role !== 'super_admin') {
                    await pool.query(`
                        UPDATE instagram_sessions 
                        SET last_customer_message_at = NOW(), awaiting_agent_reply = TRUE 
                        WHERE id = $1
                     `, [sessionId]);
                }
            }
        } catch (error: any) {
            console.error('Error marking Instagram session as awaiting reply:', error.message);
        }
    }

    async logAgentResponse(sessionId: number, userId: number, role: string, outboundMessageId: number, inboundMessageId?: number) {
        try {
            if (role === 'super_admin') return;

            const sessionResult = await pool.query(`SELECT * FROM instagram_sessions WHERE id = $1`, [sessionId]);
            const session = sessionResult.rows[0];

            if (session && session.awaiting_agent_reply && session.assigned_user_id === userId) {
                const inboundAt = new Date(session.last_customer_message_at);
                const repliedAt = new Date();
                const diffMs = repliedAt.getTime() - inboundAt.getTime();

                let finalInboundId = inboundMessageId;
                if (!finalInboundId) {
                    const lastInbound = await pool.query(`SELECT id FROM instagram_messages WHERE session_id = $1 AND direction = 'inbound' ORDER BY created_at DESC LIMIT 1`, [sessionId]);
                    finalInboundId = lastInbound.rows[0]?.id;
                }

                if (finalInboundId) {
                    await pool.query(`
                        INSERT INTO agent_response_metrics 
                        (platform, session_id, user_id, inbound_message_id, outbound_message_id, response_time_ms, inbound_at, replied_at)
                        VALUES ('instagram', $1, $2, $3, $4, $5, $6, $7)
                     `, [sessionId, userId, finalInboundId, outboundMessageId, diffMs, inboundAt, repliedAt]);

                    await pool.query(`
                        UPDATE instagram_sessions 
                        SET awaiting_agent_reply = FALSE, last_customer_message_at = NULL 
                        WHERE id = $1
                     `, [sessionId]);

                    if ((global as any).io) {
                        (global as any).io.emit("agent_performance_updated", { userId });
                    }
                }
            }
        } catch (error: any) {
            console.error('Error logging agent response (Instagram):', error.message);
        }
    }

    async sendMessage(recipientId: string, message: string, userId?: number, role?: string) {
        try {
            const data = {
                recipient: { id: recipientId },
                message: { text: message }
            };

            const response = await axios.post(this.apiUrl, data, {
                params: { access_token: this.accessToken },
                headers: { 'Content-Type': 'application/json' }
            });

            // Save to DB
            const sessionData = await this.getSessionData(recipientId);
            const savedMsg = await this.saveMessage(recipientId, 'outbound', 'text', { text: message }, { session_id: sessionData.session_id });

            // Log Performance
            if (userId && role) {
                this.logAgentResponse(sessionData.session_id, userId, role, savedMsg.id);
            }

            return response.data;
        } catch (error: any) {
            console.error('Error sending Instagram message:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Failed to send Instagram message');
        }
    }

    // Generic send media wrapper
    async sendMedia(recipientId: string, mediaType: 'image' | 'audio' | 'video', mediaUrl: string, userId?: number, role?: string) {
        try {
            const data: any = {
                recipient: { id: recipientId },
                message: {
                    attachment: {
                        type: mediaType,
                        payload: {
                            url: mediaUrl,
                            is_reusable: true
                        }
                    }
                }
            };

            console.log(`📤 Sending Instagram ${mediaType} to ${recipientId}. URL: ${mediaUrl}`);

            const response = await axios.post(this.apiUrl, data, {
                params: { access_token: this.accessToken },
                headers: { 'Content-Type': 'application/json' }
            });

            // Save to DB
            const sessionData = await this.getSessionData(recipientId);
            const savedMsg = await this.saveMessage(recipientId, 'outbound', mediaType,
                { text: `[${mediaType}]` },
                {
                    session_id: sessionData.session_id,
                    media_url: mediaUrl
                }
            );

            // Log Performance
            if (userId && role) {
                this.logAgentResponse(sessionData.session_id, userId, role, savedMsg.id);
            }

            return response.data;
        } catch (error: any) {
            console.error(`Error sending Instagram ${mediaType}:`, error.response?.data || error.message);

            // Handle specific size limit error
            if (error.response?.data?.error?.error_subcode === 2018109) {
                throw new Error(`Failed to send ${mediaType}: File size exceeds Instagram limit (approx 25MB). Please compress the file or send a smaller clip.`);
            }

            throw new Error(error.response?.data?.error?.message || `Failed to send Instagram ${mediaType}`);
        }
    }


    async getMessages(contactId: string, limit: number = 20) {
        try {
            // Fetch from DB
            const query = `
                SELECT m.id, m.session_id, m.instagram_id, m.direction, m.type, m.is_read, m.created_at,
                       p.content, p.media_url, p.media_id
                FROM instagram_messages m
                JOIN instagram_message_payloads p ON m.id = p.message_id
                JOIN instagram_sessions s ON m.session_id = s.id
                WHERE s.contact_id = $1
                ORDER BY m.created_at DESC LIMIT $2
            `;
            const result = await pool.query(query, [contactId, limit]);
            return result.rows;
        } catch (error: any) {
            console.error('Error fetching Instagram messages from DB:', error.message);
            return [];
        }
    }

    async saveMessage(instagramId: string, direction: 'inbound' | 'outbound', type: string, content: any, metadata?: { media_url?: string | null | undefined, media_id?: string | null | undefined, session_id?: number }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get session
            let sessionId = metadata?.session_id;
            if (!sessionId) {
                const session = await this.getOrCreateSession(instagramId);
                sessionId = session.id;
            }

            // 1. Insert Message Metadata
            const metaQuery = `
                INSERT INTO instagram_messages (session_id, instagram_id, direction, type)
                VALUES ($1, $2, $3, $4)
                RETURNING id, created_at
            `;
            // Ensure instagramId is stored. For inbound it's sender, outbound it's recipient? 
            // In DB design: instagram_id represents the "other party" usually, or specifically the ID in that context.
            // Lets keep it consistent: instagram_id = the contact's ID (whether sender or receiver)
            const metaResult = await client.query(metaQuery, [sessionId, instagramId, direction, type]);
            const messageId = metaResult.rows[0].id;

            // 2. Insert Payload
            const payloadQuery = `
                INSERT INTO instagram_message_payloads (message_id, content, media_url, media_id)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(payloadQuery, [
                messageId,
                content,
                metadata?.media_url || null,
                metadata?.media_id || null
            ]);

            await client.query('COMMIT');
            console.log(`✅ Instagram Message saved: ${instagramId} - ${direction}`);

            if (direction === 'inbound') {
                // Ensure sessionId is valid number
                await this.markSessionAsAwaitingReply(Number(sessionId));

                // trigger notification
                try {
                    const notificationService = new (require('./notification.service').NotificationService)();
                    await notificationService.createNotification({
                        type: 'message',
                        title: `New Instagram Message`,
                        message: `From User ${instagramId}: ${type === 'text' ? (content as any).text : '[' + type + ']'}`,
                        link: `/chat/instagram/${instagramId}`,
                        conversation_id: String(sessionId)
                    });
                } catch (notifError: any) {
                    console.error('Failed to create notification for Instagram message:', notifError.message);
                }
            }

            return {
                ...metaResult.rows[0],
                instagram_id: instagramId,
                direction,
                type,
                content
            };
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error saving Instagram message:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getConversations(userId?: number, role?: string) {
        try {
            // Similar to WhatsApp but for Instagram tables
            let query = `
                SELECT DISTINCT ON (s.contact_id)
                    s.id as session_id,
                    s.contact_id as instagram_id,
                    c.name as contact_name,
                    c.username,
                    c.profile_pic_url,
                    s.assigned_user_id,
                    m.type,
                    m.created_at,
                    p.content,
                    m.direction
                FROM instagram_sessions s
                JOIN instagram_contacts c ON s.contact_id = c.id
                LEFT JOIN instagram_messages m ON s.id = m.session_id
                LEFT JOIN instagram_message_payloads p ON m.id = p.message_id
                WHERE s.status = 'open' AND s.is_archived = FALSE
            `;
            const params: any[] = [];

            if (role && role !== 'super_admin' && role !== 'admin' && userId) {
                query += ` AND s.assigned_user_id = $1`;
                params.push(userId);
            }

            query += ` ORDER BY s.contact_id, m.created_at DESC`;

            const result = await pool.query(query, params);

            return result.rows.map(row => ({
                id: row.session_id,
                participant: {
                    name: row.contact_name || row.username || 'Instagram User',
                    id: row.instagram_id,
                    username: row.username,
                    profilePic: row.profile_pic_url
                },
                assigned_user_id: row.assigned_user_id,
                lastMessage: {
                    text: row.content?.text || (row.type && row.type !== 'text' ? `[${row.type}]` : 'No messages'),
                    created_at: row.created_at,
                    isFromUser: row.direction === 'inbound'
                },
                unreadCount: 0 // Implement unread count later
            }));
        } catch (error: any) {
            console.error('Error fetching Instagram conversations:', error.message);
            return [];
        }
    }

    async assignSession(instagramId: string, userId: number | null) {
        try {
            const query = `
                UPDATE instagram_sessions
                SET assigned_user_id = $1
                WHERE contact_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [userId, instagramId]);
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
                        FROM instagram_messages 
                        WHERE session_id = $1 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    `, [session.id]);

                    const lastMsg = lastMsgRes.rows[0];

                    if (lastMsg && lastMsg.direction === 'inbound') {
                        console.log(`📝 Instagram Session assigned to agent. Last msg was inbound. valid for tracking.`);
                        await this.markSessionAsAwaitingReply(session.id); // Sets start time to NOW()
                    }
                }
            }

            return session;
        } catch (error: any) {
            console.error('Error assigning Instagram session:', error.message);
            throw error;
        }
    }

    async toggleAI(contactId: string, status: boolean) {
        try {
            const query = `
                UPDATE instagram_sessions
                SET is_ai_active = $1
                WHERE contact_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [status, contactId]);
            return result.rows[0];
        } catch (error: any) {
            console.error('Error toggling AI status (Instagram):', error.message);
            throw error;
        }
    }

    async archiveSession(contactId: string, status: boolean) {
        try {
            const query = `
                UPDATE instagram_sessions
                SET is_archived = $1
                WHERE contact_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [status, contactId]);
            // If archiving, maybe close the session too? 
            // WhatsApp service doesn't seem to force close, but archiving usually implies done.
            // Let's just update the flag for now.
            return result.rows[0];
        } catch (error: any) {
            console.error('Error archiving/unarchiving session (Instagram):', error.message);
            throw error;
        }
    }

    /**
     * Fetch all DM conversations from the Instagram API and sync them to our DB.
     * This pulls the real inbox from Instagram so the dashboard can display all conversations.
     */
    async fetchConversationsFromAPI() {
        try {
            const tokenPreview = this.accessToken ? `${this.accessToken.substring(0, 10)}...${this.accessToken.substring(this.accessToken.length - 10)}` : 'EMPTY';
            console.log('📥 Fetching Instagram conversations from API...');
            console.log(`🔑 Token: ${tokenPreview}, Account ID: ${this.accountId}`);

            // Step 1: Get conversations list (with pagination)
            let apiUrl: string | null = `https://graph.instagram.com/v22.0/me/conversations`;
            console.log(`🌐 Calling: ${apiUrl}`);

            let allConversations: any[] = [];
            let pageCount = 0;
            const maxPages = 5; // Limit pagination to avoid rate limits

            while (apiUrl && pageCount < maxPages) {
                pageCount++;
                const response: any = await axios.get(apiUrl, {
                    params: apiUrl.includes('?') ? undefined : {
                        platform: 'instagram',
                        access_token: this.accessToken,
                        fields: 'participants,messages{message,from,to,created_time,attachments}'
                    }
                });

                const pageData = response.data.data || [];
                console.log(`� Page ${pageCount}: Found ${pageData.length} conversations`);
                allConversations = allConversations.concat(pageData);

                // Follow pagination
                apiUrl = response.data.paging?.next || null;
            }

            const conversations = allConversations;
            console.log(`📨 Total Instagram conversations found: ${conversations.length}`);

            const results: any[] = [];

            for (const convo of conversations) {
                try {
                    // Extract participants
                    const participants = convo.participants?.data || [];
                    // Find the other person (not our account)
                    const otherParticipant = participants.find((p: any) => p.id !== this.accountId) || participants[0];

                    if (!otherParticipant) continue;

                    const contactId = otherParticipant.id;
                    const contactName = otherParticipant.name || otherParticipant.username || 'Instagram User';
                    const username = otherParticipant.username || '';

                    // Sync contact to DB
                    await this.getOrCreateContact(contactId, username, contactName);

                    // Sync session to DB
                    const session = await this.getOrCreateSession(contactId);

                    // Get latest message from this conversation
                    const messages = convo.messages?.data || [];
                    let lastMessageText = 'No messages';
                    let lastMessageTime = session.created_at;
                    let lastMessageDirection = 'inbound';

                    if (messages.length > 0) {
                        const latestMsg = messages[0];
                        lastMessageText = latestMsg.message || '[Media]';
                        lastMessageTime = latestMsg.created_time;
                        lastMessageDirection = latestMsg.from?.id === this.accountId ? 'outbound' : 'inbound';

                        // Sync messages to DB (latest batch)
                        for (const msg of messages.reverse()) {
                            try {
                                const msgDirection = msg.from?.id === this.accountId ? 'outbound' : 'inbound';
                                const msgText = msg.message || '';
                                let msgType = 'text';
                                let mediaUrl: string | undefined;

                                // Check for attachments and upload to S3
                                if (msg.attachments && msg.attachments.data && msg.attachments.data.length > 0) {
                                    const attachment = msg.attachments.data[0];
                                    msgType = attachment.mime_type?.startsWith('image') ? 'image'
                                        : attachment.mime_type?.startsWith('video') ? 'video'
                                            : attachment.mime_type?.startsWith('audio') ? 'audio'
                                                : attachment.type || 'image';

                                    // Get the attachment URL (could be in image_data, video_data, file_url, etc.)
                                    const attachmentUrl = attachment.image_data?.url
                                        || attachment.video_data?.url
                                        || attachment.file_url
                                        || attachment.url;

                                    if (attachmentUrl) {
                                        try {
                                            console.log(`📎 Downloading attachment: ${msgType} from ${attachmentUrl.substring(0, 80)}...`);

                                            // Download the media from Instagram's URL
                                            const mediaResponse = await axios.get(attachmentUrl, {
                                                responseType: 'arraybuffer',
                                                timeout: 30000
                                            });

                                            const buffer = Buffer.from(mediaResponse.data);
                                            const mimeType = mediaResponse.headers['content-type'] || attachment.mime_type || 'image/jpeg';

                                            // Upload to S3 (DigitalOcean Spaces)
                                            const s3Url = await this.mediaUploadService.uploadMedia(
                                                buffer,
                                                mimeType,
                                                session.id.toString(),
                                                msgType,
                                                buffer.length
                                            );

                                            mediaUrl = s3Url;
                                            console.log(`✅ Media uploaded to S3: ${s3Url}`);
                                        } catch (uploadError: any) {
                                            console.warn(`⚠️ Failed to upload media to S3: ${uploadError.message}`);
                                            // Fall back to Instagram's URL (may expire)
                                            mediaUrl = attachmentUrl;
                                        }
                                    }
                                }

                                const content: any = { text: msgText || '' };
                                if (mediaUrl) {
                                    content.media_url = mediaUrl;
                                    content.media_type = msgType;
                                    if (!content.text) content.text = `[${msgType}]`;
                                } else if (!content.text) {
                                    content.text = '[Media]';
                                }

                                await this.saveMessage(
                                    contactId,
                                    msgDirection,
                                    msgType,
                                    content,
                                    { session_id: session.id, media_url: mediaUrl, media_id: msg.id }
                                );
                            } catch (e: any) {
                                // Skip duplicate messages silently
                                if (!e.message?.includes('duplicate')) {
                                    console.warn('⚠️ Could not save message:', e.message);
                                }
                            }
                        }
                    }

                    results.push({
                        id: session.id,
                        conversation_id: convo.id,
                        participant: {
                            name: contactName,
                            id: contactId,
                            username: username,
                            profilePic: ''
                        },
                        assigned_user_id: session.assigned_user_id,
                        lastMessage: {
                            text: lastMessageText,
                            created_at: lastMessageTime,
                            isFromUser: lastMessageDirection === 'inbound'
                        },
                        unreadCount: 0
                    });
                } catch (convoError: any) {
                    console.error('Error processing conversation:', convoError.message);
                }
            }

            return results;
        } catch (error: any) {
            console.error('Error fetching conversations from Instagram API:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch Instagram conversations');
        }
    }

    /**
     * Fetch messages for a specific conversation from the Instagram API.
     */
    async fetchMessagesFromAPI(conversationId: string) {
        try {
            console.log(`📥 Fetching messages for conversation ${conversationId} from Instagram API...`);

            const response = await axios.get(`https://graph.instagram.com/v22.0/${conversationId}`, {
                params: {
                    access_token: this.accessToken,
                    fields: 'messages{message,from,to,created_time,attachments}'
                }
            });

            const messages = response.data.messages?.data || [];

            return messages.map((msg: any) => ({
                id: msg.id,
                from: msg.from,
                to: msg.to?.data || [],
                text: msg.message || '',
                created_at: msg.created_time,
                attachments: msg.attachments?.data || [],
                direction: msg.from?.id === this.accountId ? 'outbound' : 'inbound'
            }));
        } catch (error: any) {
            console.error('Error fetching messages from Instagram API:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch messages from Instagram');
        }
    }
}
