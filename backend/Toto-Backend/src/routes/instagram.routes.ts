import { Router } from 'express';
import { InstagramController } from '../controllers/instagram.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const instagramController = new InstagramController();

/**
 * @swagger
 * tags:
 *   name: Instagram
 *   description: Instagram Integration API
 */

/**
 * @swagger
 * /instagram/webhook:
 *   get:
 *     summary: Verify Instagram Webhook
 *     tags: [Instagram]
 *   post:
 *     summary: Receive Instagram Webhook Events
 *     tags: [Instagram]
 */
router.get('/webhook', (req, res) => instagramController.verifyWebhook(req, res));
router.post('/webhook', (req, res) => instagramController.handleWebhook(req, res));

/**
 * @swagger
 * /instagram/send:
 *   post:
 *     summary: Send text message
 *     tags: [Instagram]
 */
router.post('/send', authMiddleware, (req, res) => instagramController.sendMessage(req, res));

/**
 * @swagger
 * /instagram/send-image:
 *   post:
 *     summary: Send image
 *     tags: [Instagram]
 */
router.post('/send-image', authMiddleware, (req, res) => instagramController.sendImage(req, res));

/**
 * @swagger
 * /instagram/send-video:
 *   post:
 *     summary: Send video
 *     tags: [Instagram]
 */
router.post('/send-video', authMiddleware, (req, res) => instagramController.sendVideo(req, res));

/**
 * @swagger
 * /instagram/send-audio:
 *   post:
 *     summary: Send audio
 *     tags: [Instagram]
 */
router.post('/send-audio', authMiddleware, (req, res) => instagramController.sendAudio(req, res));

/**
 * @swagger
 * /instagram/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Instagram]
 */
router.get('/conversations', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => instagramController.getConversations(req, res));

/**
 * @swagger
 * /instagram/messages/{id}:
 *   get:
 *     summary: Get messages for a contact
 *     tags: [Instagram]
 */
router.get('/messages/:id', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => instagramController.getMessages(req, res));

/**
 * @swagger
 * /instagram/session-status/{id}:
 *   get:
 *     summary: Get session status for a contact
 *     tags: [Instagram]
 */
router.get('/session-status/:id', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => instagramController.getSessionStatus(req, res));

/**
 * @swagger
 * /instagram/conversations/{id}/assign:
 *   put:
 *     summary: Assign conversation to user
 *     tags: [Instagram]
 */
router.put('/conversations/:id/assign', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => instagramController.assignConversation(req, res));

/**
 * @swagger
 * /instagram/conversations/{id}/toggle-ai:
 *   put:
 *     summary: Toggle AI for conversation
 *     tags: [Instagram]
 */
router.put('/conversations/:id/toggle-ai', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => instagramController.toggleAI(req, res));

/**
 * @swagger
 * /instagram/conversations/{id}/archive:
 *   put:
 *     summary: Archive/Unarchive conversation
 *     tags: [Instagram]
 */
router.put('/conversations/:id/archive', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => instagramController.archiveConversation(req, res));

/**
 * @swagger
 * /instagram/sync-conversations:
 *   get:
 *     summary: Force sync conversations from Instagram API
 *     tags: [Instagram]
 */
router.get('/sync-conversations', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => instagramController.syncConversations(req, res));

/**
 * @swagger
 * /instagram/api-messages/{conversationId}:
 *   get:
 *     summary: Get messages for a conversation from Instagram API
 *     tags: [Instagram]
 */
router.get('/api-messages/:conversationId', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => instagramController.getAPIMessages(req, res));

export const instagramRoutes = router;
