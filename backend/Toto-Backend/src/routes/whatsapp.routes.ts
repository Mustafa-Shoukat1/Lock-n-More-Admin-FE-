import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const whatsAppController = new WhatsAppController();



/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: WhatsApp Integration API
 */

/**
 * @swagger
 * /whatsapp/send:
 *   post:
 *     summary: Send a WhatsApp message
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number
 *               templateName:
 *                 type: string
 *                 description: Name of the template to send (optional if message is provided)
 *               message:
 *                 type: string
 *                 description: Custom text message to send (optional if templateName is provided)
 *               languageCode:
 *                 type: string
 *                 default: en
 *                 description: Language code for the template
 *               variables:
 *                 type: array
 *                 items:
 *                    type: string
 *                 description: Array of variables for the template body (e.g. {{1}}, {{2}})
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing parameters
 *       500:
 *         description: Server error
 */
router.post('/send', authMiddleware, (req, res) => whatsAppController.sendMessage(req, res));

/**
 * @swagger
 * /whatsapp/send-image:
 *   post:
 *     summary: Send an image via WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               mediaId:
 *                 type: string
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image sent successfully
 */
router.post('/send-image', authMiddleware, (req, res) => whatsAppController.sendImage(req, res));

/**
 * @swagger
 * /whatsapp/send-audio:
 *   post:
 *     summary: Send an audio file via WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               mediaId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audio sent successfully
 */
router.post('/send-audio', authMiddleware, (req, res) => whatsAppController.sendAudio(req, res));

/**
 * @swagger
 * /whatsapp/send-video:
 *   post:
 *     summary: Send a video via WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               mediaId:
 *                 type: string
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Video sent successfully
 */
router.post('/send-video', authMiddleware, (req, res) => whatsAppController.sendVideo(req, res));

/**
 * @swagger
 * /whatsapp/contacts:
 *   get:
 *     summary: Fetch available contacts
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: List of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/contacts', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => whatsAppController.getContacts(req, res));

/**
 * @swagger
 * /whatsapp/contacts:
 *   post:
 *     summary: Create or update a contact
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact created or updated successfully
 *       400:
 *         description: Missing parameters
 *       500:
 *         description: Server error
 */
router.post('/contacts', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => whatsAppController.createContact(req, res));



/**
 * @swagger
 * /whatsapp/conversations:
 *   get:
 *     summary: Fetch all conversations
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   participant:
 *                     type: object
 *                   lastMessage:
 *                     type: object
 *                   unreadCount:
 *                     type: integer
 *       500:
 *         description: Server error
 */
// ... existing code ...


/**
 * @swagger
 * /whatsapp/conversations:
 *   get:
 *     summary: Fetch all conversations (Filtered by role)
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => whatsAppController.getConversations(req, res));

// ... existing code ...

/**
 * @swagger
 * /whatsapp/conversations/{phone}/assign:
 *   put:
 *     summary: Assign a conversation to a specific user
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to assign the chat to (or null to unassign)
 *     responses:
 *       200:
 *         description: Conversation assigned successfully
 */
router.put('/conversations/:phone/assign', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => whatsAppController.assignConversation(req, res));

/**
 * @swagger
 * /whatsapp/conversations/{phone}/archive:
 *   put:
 *     summary: Archive conversation by phone number
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Conversation archived
 */
router.put('/conversations/:phone/archive', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => whatsAppController.archiveConversationByPhone(req, res));


/**
 * @swagger
 * /whatsapp/webhook:
 *   get:
 *     summary: Verify WhatsApp webhook
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook verified
 *   post:
 *     summary: Receive WhatsApp webhook events
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Event received
 */
router.get('/webhook', (req, res) => whatsAppController.verifyWebhook(req, res));
router.post('/webhook', (req, res) => whatsAppController.handleWebhook(req, res));

/**
 * @swagger
 * /whatsapp/messages/{phone}:
 *   get:
 *     summary: Fetch message history for a phone number
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/messages/:phone', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => whatsAppController.getMessages(req, res));

/**
 * @swagger
 * /whatsapp/messages/{phone}/read:
 *   put:
 *     summary: Mark all messages from a phone number as read
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put('/messages/:phone/read', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => whatsAppController.markAsRead(req, res));

/**
 * @swagger
 * /whatsapp/session-status/{phone}:
 *   get:
 *     summary: Get the WhatsApp session window status for a phone number
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session status data
 */
router.get('/session-status/:phone', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => whatsAppController.getSessionStatus(req, res));

/**
 * @swagger
 * /whatsapp/media/{mediaId}:
 *   get:
 *     summary: Proxy a WhatsApp media file (image/video/audio)
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media file streamed successfully
 */
router.get('/media/:mediaId', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => whatsAppController.getMedia(req, res));

/**
 * @swagger
 * /whatsapp/archive/{sessionId}:
 *   put:
 *     summary: Archive or unarchive a conversation session
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Session archiving status updated successfullly
 */
router.put('/archive/:sessionId', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => whatsAppController.archiveConversation(req, res));

/**
 * @swagger
 * /whatsapp/conversations/{phone}/update-ai:
 *   put:
 *     summary: Update AI status for a conversation (Enable/Disable AI)
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_ai_active:
 *                 type: boolean
 *                 description: Set to true to enable AI, false to disable
 *     responses:
 *       200:
 *         description: AI status updated successfully
 */
router.put('/conversations/:phone/update-ai', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => whatsAppController.updateAIStatusByPhone(req, res));
export const whatsappRoutes = router;
