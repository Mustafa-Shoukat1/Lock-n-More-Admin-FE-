import { Request, Response } from 'express';
import { InstagramService } from '../services/instagram.service';
import { AIService } from '../services/ai.service'; // Reuse AI service if needed

const instagramService = new InstagramService();
const aiService = new AIService();

export class InstagramController {

    // Verify Webhook (GET)
    verifyWebhook(req: Request, res: Response) {
        const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "start_123_456";

        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ Instagram Webhook Verified Successfully');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }

    // Handle Webhook (POST)
    async handleWebhook(req: Request, res: Response) {
        try {
            const body = req.body;
            console.log('📨 Instagram Webhook Incoming Payload:', JSON.stringify(body, null, 2));

            if (body.object === 'instagram') {
                for (const entry of body.entry) {
                    // Format 1: Instagram API with Instagram Login uses "changes" array
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            if (change.field === 'messages' && change.value) {
                                // The event data is inside change.value
                                console.log('📩 Processing Instagram change event:', JSON.stringify(change.value, null, 2));
                                await this.processEvent(change.value);
                            }
                        }
                    }

                    // Format 2: Messenger Platform uses "messaging" array
                    if (entry.messaging) {
                        for (const event of entry.messaging) {
                            await this.processEvent(event);
                        }
                    }
                }

                res.sendStatus(200);
            } else {
                console.warn('⚠️ Received webhook event but object is not instagram:', body.object);
                res.sendStatus(404);
            }
        } catch (error: any) {
            console.error('Error handling Instagram webhook:', error);
            res.sendStatus(500);
        }
    }

    private async processEvent(event: any) {
        try {
            const senderId = event.sender?.id;
            const recipientId = event.recipient?.id;
            const timestamp = event.timestamp;

            if (!senderId) {
                console.warn('⚠️ Instagram webhook event missing sender.id, skipping');
                return;
            }

            // Handle Read Receipt
            if (event.read) {
                console.log(`📖 Instagram Read receipt from ${senderId}`);
                return;
            }

            // Handle Message
            if (!event.message) {
                console.log(`ℹ️ Instagram event from ${senderId} has no message, skipping`);
                return;
            }

            const message = event.message;
            const messageId = message.mid;
            const text = message.text;
            const attachments = message.attachments;

            // STEP 1 — Ensure contact exists
            await instagramService.getOrCreateContact(senderId);

            // STEP 2 — Find or create session
            const session = await instagramService.getOrCreateSession(senderId);

            // STEP 3 — Handle message types
            let type = 'text';
            let content: any = {};
            let mediaUrl: string | null = null;
            let mediaId: string | null = messageId || null;

            if (attachments && attachments.length > 0) {
                const attachment = attachments[0];
                const attachmentType = attachment.type;

                try {
                    switch (attachmentType) {
                        // CASE B: Direct media uploads (image, video, audio)
                        case 'image':
                        case 'video':
                        case 'audio': {
                            type = attachmentType;
                            const payloadUrl = attachment.payload?.url;
                            mediaId = attachment.payload?.id || messageId;

                            if (payloadUrl) {
                                // Download and upload to S3
                                try {
                                    console.log(`📎 Downloading ${type} from Instagram...`);
                                    const axios = (await import('axios')).default;
                                    const mediaResponse = await axios.get(payloadUrl, {
                                        responseType: 'arraybuffer',
                                        timeout: 30000
                                    });
                                    const buffer = Buffer.from(mediaResponse.data);
                                    const headerMimeType = mediaResponse.headers['content-type'];
                                    const mimeType = typeof headerMimeType === 'string'
                                        ? headerMimeType
                                        : `${type}/${type === 'image' ? 'jpeg' : 'mp4'}`;

                                    const s3Url = await instagramService.uploadMediaToS3(
                                        buffer, mimeType, session.id.toString(), type, buffer.length
                                    );
                                    mediaUrl = s3Url;
                                    console.log(`✅ Media uploaded to S3: ${s3Url}`);
                                } catch (uploadErr: any) {
                                    console.warn(`⚠️ S3 upload failed, using original URL: ${uploadErr.message}`);
                                    mediaUrl = payloadUrl;
                                }
                            }

                            content = {
                                media_type: type,
                                media_url: mediaUrl,
                                ...(text ? { text } : {})
                            };
                            break;
                        }

                        // CASE C: Reel / Post Share (media_share)
                        case 'media_share': {
                            type = 'shared_media';
                            mediaId = attachment.payload?.id || null;

                            content = {
                                media_type: 'shared_media',
                                original_media_type: attachment.payload?.media_type || null,
                                caption: attachment.payload?.caption || null,
                                permalink: attachment.payload?.permalink || null
                            };
                            // Do NOT download reel/post media
                            mediaUrl = null;
                            console.log(`🔗 Shared media received: ${content.permalink || 'no permalink'}`);
                            break;
                        }

                        // CASE D: Story Mention
                        case 'story_mention': {
                            type = 'story_mention';
                            mediaId = attachment.payload?.id || null;

                            content = {
                                media_type: 'story_mention',
                                permalink: attachment.payload?.permalink || null
                            };
                            mediaUrl = null;
                            console.log(`📸 Story mention received from ${senderId}`);
                            break;
                        }

                        // Default: unknown attachment type
                        default: {
                            type = attachmentType || 'unknown';
                            mediaUrl = attachment.payload?.url || null;
                            mediaId = attachment.payload?.id || messageId;
                            content = {
                                media_type: type,
                                media_url: mediaUrl,
                                ...(text ? { text } : { text: `[${type}]` })
                            };
                            console.log(`❓ Unknown attachment type: ${attachmentType}`);
                            break;
                        }
                    }
                } catch (attachErr: any) {
                    console.error(`❌ Error parsing attachment: ${attachErr.message}`);
                    type = 'text';
                    content = { text: text || '[Unsupported attachment]' };
                }
            } else {
                // CASE A: Pure text message
                type = 'text';
                content = { text: text || '' };
            }

            // Save message to DB
            const saved = await instagramService.saveMessage(senderId, 'inbound', type, content, {
                session_id: session.id,
                media_url: mediaUrl,
                media_id: mediaId
            });

            // STEP 4 — Update session activity
            try {
                await instagramService.updateSessionActivity(session.id);
            } catch (e: any) {
                console.warn(`⚠️ Failed to update session activity: ${e.message}`);
            }

            // STEP 5 — Emit normalized response to frontend via Socket
            if ((global as any).io) {
                const normalizedMessage = {
                    id: saved.id,
                    session_id: session.id,
                    channel: 'instagram',
                    direction: 'inbound',
                    type,
                    content,
                    media_url: mediaUrl,
                    created_at: saved.created_at
                };

                console.log('📡 Emitting new_instagram_message to socket');
                (global as any).io.emit('new_instagram_message', {
                    ...normalizedMessage,
                    participant: {
                        id: senderId,
                        name: 'Instagram User',
                    },
                    lastMessage: {
                        text: content.text || `[${type}]`,
                        created_at: saved.created_at,
                        isFromUser: true
                    }
                });
            }

            // AI Response (only for text messages)
            if (session.is_ai_active && type === 'text' && content.text) {
                console.log(`🤖 AI Processing Instagram message from ${senderId}...`);
                try {
                    // Default system prompt
                    const systemPrompt = "You are a helpful customer service assistant for 'Locks 'n More'. You can answer questions about our products using the information provided. Be concise and professional.";

                    const aiResponse = await aiService.generateResponse(session.id.toString(), content.text, systemPrompt, {
                        userId: senderId,
                        platform: 'instagram'
                    });

                    // Send AI response
                    await instagramService.sendMessage(senderId, aiResponse);
                    console.log(`🤖 AI Responded to ${senderId}`);

                } catch (aiError: any) {
                    console.error('❌ Error in AI processing for Instagram:', aiError.message);
                }
            }

            console.log(`✅ Instagram message processed: ${type}`);

        } catch (error: any) {
            console.error('❌ Error processing Instagram event:', error.message);
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const { to, message, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            if (!to || !message) {
                return res.status(400).json({ error: 'Missing to or message' });
            }
            const result = await instagramService.sendMessage(to, message, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendImage(req: Request, res: Response) {
        try {
            const { to, imageUrl, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            if (!to || !imageUrl) {
                return res.status(400).json({ error: 'Missing to or imageUrl' });
            }
            const result = await instagramService.sendMedia(to, 'image', imageUrl, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendVideo(req: Request, res: Response) {
        try {
            let { to, videoUrl, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            // Handle base64 video upload (same logic as WhatsApp)
            if (videoUrl && (videoUrl.startsWith('data:') || videoUrl.length > 500)) {
                console.log('📦 [Instagram] Detected base64/binary video data, uploading to S3...');
                try {
                    const mediaUploadService = new (require('../services/mediaUpload.service').MediaUploadService)();

                    let base64Data = videoUrl;
                    let mimeType = 'video/mp4';

                    if (videoUrl.startsWith('data:')) {
                        const matches = videoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            mimeType = matches[1];
                            base64Data = matches[2];
                        }
                    }

                    const buffer = Buffer.from(base64Data, 'base64');
                    // Upload to 'instagram_uploads' prefix
                    const s3Url = await mediaUploadService.uploadMedia(buffer, mimeType, 'instagram_uploads', 'video', buffer.length);

                    console.log(`✅ [Instagram] Uploaded base64 video to S3: ${s3Url}`);
                    videoUrl = s3Url;
                } catch (uploadError: any) {
                    console.error('❌ [Instagram] Failed to upload base64 video:', uploadError.message);
                    return res.status(500).json({ error: 'Failed to upload video file.' });
                }
            }

            if (!to || !videoUrl) {
                return res.status(400).json({ error: 'Missing to or videoUrl' });
            }
            const result = await instagramService.sendMedia(to, 'video', videoUrl, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendAudio(req: Request, res: Response) {
        try {
            // Instagram might not support audio via API generic template or likely expects 'audio' attachment
            const { to, audioUrl, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            if (!to || !audioUrl) {
                return res.status(400).json({ error: 'Missing to or audioUrl' });
            }
            const result = await instagramService.sendMedia(to, 'audio', audioUrl, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getConversations(req: Request, res: Response) {
        try {
            // Return conversations from our DB (populated via webhooks)
            // Note: The Instagram Conversations API requires Advanced Access (App Review)
            // so we rely on webhooks to capture messages in real-time
            const user = (req as any).user;
            // Fallback to query params
            const userId = user?.id || (req.query.userId ? Number(req.query.userId) : undefined);
            const role = user?.role || (req.query.role as string);

            console.log(`🔍 Fetching Instagram conversations for UserID: ${userId}, Role: ${role}`);

            const conversations = await instagramService.getConversations(userId, role);
            res.status(200).json(conversations);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Force sync conversations from Instagram API
    async syncConversations(req: Request, res: Response) {
        try {
            const conversations = await instagramService.fetchConversationsFromAPI();
            res.status(200).json({
                success: true,
                count: conversations.length,
                conversations
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Fetch messages for a conversation directly from Instagram API
    async getAPIMessages(req: Request, res: Response) {
        try {
            const { conversationId } = req.params;
            if (!conversationId) return res.status(400).json({ error: 'Conversation ID is required' });

            const messages = await instagramService.fetchMessagesFromAPI(conversationId as string);
            res.status(200).json(messages);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSessionStatus(req: Request, res: Response) {
        try {
            const { id } = req.params; // Instagram User ID
            if (!id) {
                return res.status(400).json({ error: 'Instagram User ID is required' });
            }
            const data = await instagramService.getSessionData(id as string);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const { id } = req.params; // Instagram User ID (IGSID)
            const { limit } = req.query;
            if (!id) return res.status(400).json({ error: 'ID is required' });

            const messages = await instagramService.getMessages(id as string, limit ? Number(limit) : 20);
            res.status(200).json(messages);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async assignConversation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            if (!id) return res.status(400).json({ error: 'ID is required' });

            const result = await instagramService.assignSession(id as string, userId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async toggleAI(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body; // boolean

            if (!id || status === undefined) {
                return res.status(400).json({ error: 'ID and status are required' });
            }

            const result = await instagramService.toggleAI(id as string, status);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async archiveConversation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body; // boolean

            if (!id || status === undefined) {
                return res.status(400).json({ error: 'ID and status are required' });
            }

            const result = await instagramService.archiveSession(id as string, status);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
