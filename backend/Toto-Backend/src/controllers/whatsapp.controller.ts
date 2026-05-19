import { Request, Response } from 'express';
import { WhatsAppService } from '../services/whatsapp.service';
import { AIService } from '../services/ai.service';

const whatsAppService = new WhatsAppService();
const aiService = new AIService();

export class WhatsAppController {
    async sendMessage(req: Request, res: Response) {
        try {
            let { to, templateName = 'custom_message', languageCode, message, variables, userId, role } = req.body;

            // Fallback to authenticated user if available
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            if (!to || (!templateName && !message)) {
                return res.status(400).json({ error: 'Missing required parameters: to, and either templateName or message' });
            }

            if (!variables && message) {
                variables = [message];
            }

            const result = await whatsAppService.sendMessage(to, templateName, languageCode, message, variables, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendImage(req: Request, res: Response) {
        try {
            const { to, imageUrl, mediaId, caption, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            if (!to || (!imageUrl && !mediaId)) {
                return res.status(400).json({ error: 'Missing required parameters: to, and either imageUrl or mediaId' });
            }
            const result = await whatsAppService.sendImage(to, imageUrl, mediaId, caption, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendAudio(req: Request, res: Response) {
        try {
            const { to, audioUrl, mediaId, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            if (!to || (!audioUrl && !mediaId)) {
                return res.status(400).json({ error: 'Missing required parameters: to, and either audioUrl or mediaId' });
            }
            const result = await whatsAppService.sendAudio(to, audioUrl, mediaId, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendVideo(req: Request, res: Response) {
        try {
            let { to, videoUrl, mediaId, caption, userId: bodyUserId, role: bodyRole } = req.body;

            let userId = bodyUserId;
            let role = bodyRole;
            const user = (req as any).user;
            if (user) {
                userId = user.id;
                role = user.role;
            }

            // Check if videoUrl is base64 (roughly)
            if (videoUrl && (videoUrl.startsWith('data:') || videoUrl.length > 500)) {
                console.log('📦 Detected base64/binary video data, uploading to S3...');
                try {
                    const mediaUploadService = new (require('../services/mediaUpload.service').MediaUploadService)();

                    // Extract buffer from base64
                    // Format: "data:video/mp4;base64,AAAA..." or just "AAAA..."
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
                    // Use a temporary session ID or similar for organization, or just 'whatsapp-upload'
                    const s3Url = await mediaUploadService.uploadMedia(buffer, mimeType, 'whatsapp_uploads', 'video', buffer.length);

                    console.log(`✅ Uploaded base64 video to S3: ${s3Url}`);
                    videoUrl = s3Url;
                } catch (uploadError: any) {
                    console.error('❌ Failed to upload base64 video:', uploadError.message);
                    return res.status(500).json({ error: 'Failed to upload video file.' });
                }
            }

            if (!to || (!videoUrl && !mediaId)) {
                return res.status(400).json({ error: 'Missing required parameters: to, and either videoUrl or mediaId' });
            }
            const result = await whatsAppService.sendVideo(to, videoUrl, mediaId, caption, userId, role);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getContacts(req: Request, res: Response) {
        try {
            const contacts = await whatsAppService.getContacts();
            res.status(200).json(contacts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createContact(req: Request, res: Response) {
        try {
            const { name, phone } = req.body;
            if (!name || !phone) {
                return res.status(400).json({ error: 'Name and phone are required' });
            }
            const contact = await whatsAppService.getOrCreateContact(phone, name);
            res.status(200).json(contact);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getConversations(req: Request, res: Response) {
        try {
            // Check if user is authenticated (via authMiddleware) or passed via query
            const user = (req as any).user;
            // Fallback to query params if authMiddleware is removed or not used
            const userId = user?.id || (req.query.userId ? Number(req.query.userId) : undefined);
            const role = user?.role || (req.query.role as string);

            console.log(`🔍 Fetching WhatsApp conversations for UserID: ${userId}, Role: ${role}`);

            const conversations = await whatsAppService.getConversations(userId, role);
            res.status(200).json(conversations);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async assignConversation(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            const { userId } = req.body; // Can be null to unassign

            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }

            const result = await whatsAppService.assignSession(phone as string, userId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleWebhook(req: Request, res: Response) {
        try {
            const body = req.body;
            console.log('📨 Webhook Incoming Payload:', JSON.stringify(body, null, 2));

            // Check if the request is from WhatsApp
            if (body.object === 'whatsapp_business_account') {

                // Navigate the Meta JSON structure to find the message
                const entry = body.entry?.[0];
                const changes = entry?.changes?.[0];
                const value = changes?.value;
                const message = value?.messages?.[0];

                if (message) {
                    const from = message.from;
                    const text = message.text?.body;
                    const contactName = value.contacts?.[0]?.profile?.name || from;
                    const timestamp = new Date();

                    console.log(`📩 Real-time message from ${contactName} (${from}): ${text}`);

                    const messageTypeRaw = message.type as string || 'text';
                    const messageType = messageTypeRaw; // Keep it as string, don't force enum yet until DB check passed? 
                    // Actually, let's keep messageType logic as before but handle content correctly.

                    let content = message.text ? { text: message.text.body } : { type: message.type, [message.type]: message[message.type] };

                    // Extract media ID if applicable
                    let incomingMediaId: string | undefined;
                    if (['image', 'audio', 'video', 'document'].includes(messageType)) {
                        incomingMediaId = message[messageType]?.id;
                    }

                    // 1. Ensure contact exists and save message (metadata & payload)
                    await whatsAppService.getOrCreateContact(from, contactName);

                    let mediaUrl: string | undefined;
                    let mediaSize: number | undefined;

                    // Resolve session first to follow folder structure requirement
                    const sessionData = await whatsAppService.getOrCreateSession(from);
                    const sessionId = sessionData.id;

                    if (incomingMediaId) {
                        try {
                            const uploadResult = await whatsAppService.processIncomingMedia(incomingMediaId, messageType, sessionId);
                            mediaUrl = uploadResult.mediaUrl;
                            mediaSize = uploadResult.size;
                        } catch (err) {
                            console.error('Failed to upload media to Spaces:', err);
                        }
                    }

                    // DB ENUM FIX: 'document' is not in the ENUM. Map it to 'text' or 'image' if appropriate.
                    // Ideally we should update the Enum, but for now let's save as 'text' with a note,
                    // or 'image' if the frontend can handle it (probably not).
                    // 'text' is the safest fallback if we can't change DB.
                    // However, we want to start supporting it.
                    // Let's assume for now we must map to 'text' if it's not in the allowed list: text, template, image, audio, video.
                    let dbMessageType = messageType;
                    if (!['text', 'template', 'image', 'audio', 'video'].includes(messageType)) {
                        console.warn(`Type '${messageType}' not in DB enum. Saving as 'text'.`);
                        dbMessageType = 'text';
                        // Append media URL to text body if it's a document so user sees something
                        if (messageType === 'document' && (content as any).document) {
                            // Check if content has text
                            const doc = (content as any).document;
                            const caption = doc.caption || (content as any).caption || `[Document] ${doc.filename || 'File'}`;
                            content = { text: caption } as any;
                        } else if (messageType === 'reaction') {
                            const reactionObj = (message as any).reaction;
                            const emoji = reactionObj?.emoji || '👍'; // Default fallback if missing
                            content = { text: emoji } as any;
                        } else {
                            content = { text: `[${messageType}]` } as any;
                        }
                    }

                    const saved = await whatsAppService.saveMessage(from, 'inbound', dbMessageType as any, content, {
                        media_id: incomingMediaId,
                        media_url: mediaUrl,
                        session_id: sessionId
                    });

                    // 2. Emit to Dashboard via Socket.io
                    if ((global as any).io) {
                        console.log('📡 Emitting new_whatsapp_message to socket');
                        (global as any).io.emit('new_whatsapp_message', {
                            id: saved.session_id,
                            participant: {
                                name: contactName,
                                phone: from
                            },
                            lastMessage: {
                                text: text || `[${messageType}]`,
                                created_at: saved.created_at,
                                isFromUser: true
                            }
                        });

                    } else {
                        console.warn('⚠️ Socket.io instance not found on global object');
                    }

                    // 3. Trigger AI Response if Active
                    try {
                        const sessionData = await whatsAppService.getSessionData(from);
                        // Default to true if you want AI to match your request "whenever I get a message ... responds"
                        // Or check sessionData.is_ai_active.
                        // For now, let's assume if it is NOT EXPLICITLY disabled, we respond.
                        // Or better, check the DB flag.
                        if (sessionData.is_ai_active) {
                            console.log(`🤖 AI Processing message from ${from}...`);
                            // Only respond to text messages for now to save cost/complexity
                            if (messageType === 'text') {
                                // Default system prompt for the business
                                const systemPrompt = "You are a helpful customer service assistant for 'Locks 'n More'. You can answer questions about our products using the information provided. Be concise and professional.";

                                const aiResponse = await aiService.generateResponse(sessionId, text || '', systemPrompt, {
                                    userId: from,
                                    platform: 'whatsapp'
                                });
                                await whatsAppService.sendMessage(from, undefined, 'en', aiResponse);
                                console.log(`🤖 AI Responded to ${from}`);
                            }
                        }
                    } catch (error) {
                        console.error('Error in AI processing:', error);
                    }
                } else {
                    console.log('ℹ️ Webhook received but no message found (status update or other event)');
                }

                // Return a 200 OK so Meta knows you received it
                res.sendStatus(200);
            } else {
                console.warn('⚠️ Received webhook event but object is not whatsapp_business_account:', body.object);
                // Not a WhatsApp event
                res.sendStatus(404);
            }
        } catch (error: any) {
            console.error('Error handling webhook:', error);
            res.sendStatus(500);
        }
    }

    verifyWebhook(req: Request, res: Response) {
        const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

        if (!VERIFY_TOKEN) {
            return res.sendStatus(500);
        }

        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ Webhook Verified Successfully');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            const { limit, before } = req.query;
            const messages = await whatsAppService.getMessages(
                phone as string,
                limit ? parseInt(limit as string) : 1000,
                before as string
            );
            res.status(200).json(messages);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            const count = await whatsAppService.markMessagesAsRead(phone as string);
            res.status(200).json({ success: true, markedAsRead: count });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSessionStatus(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            const data = await whatsAppService.getSessionData(phone as string);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMedia(req: Request, res: Response) {
        // Deprecated: Media is now uploaded directly to Spaces and accessed via public URL
        // Keeping this for backward compatibility if needed, or returning 410 Gone / 301 Moved.
        try {
            const { mediaId } = req.params;
            if (!mediaId) {
                return res.status(400).json({ error: 'Media ID is required' });
            }

            console.warn(`⚠️ Deprecated /api/whatsapp/media/${mediaId} called. Use direct Spaces URL instead.`);

            // Fallback: Proxy from Meta if we still have to (e.g. old messages)
            const { data, mimeType } = await whatsAppService.getMedia(mediaId as string);

            res.setHeader('Content-Type', mimeType as string);
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
            res.send(data);
        } catch (error: any) {
            console.error('Error proxying media:', error.message);
            res.status(500).json({ error: 'Failed to load media' });
        }
    }

    async archiveConversation(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const { isArchived } = req.body;
            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }
            const result = await whatsAppService.archiveConversation(sessionId as string, isArchived);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async archiveConversationByPhone(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            const { isArchived } = req.body;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            const result = await whatsAppService.archiveSessionByPhone(phone as string, isArchived);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateAIStatusByPhone(req: Request, res: Response) {
        try {
            const { phone } = req.params;
            const { is_ai_active } = req.body;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }

            // Resolve session by phone
            const session = await whatsAppService.getOrCreateSession(phone as string);

            const result = await whatsAppService.UpdateSessionForAI(session.id, is_ai_active);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
