import { Router } from 'express';
import { TikTokController } from '../controllers/tiktok.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { TikTokOAuthHelper } from '../utils/tiktok-oauth.helper';

const router = Router();
const controller = new TikTokController();

/**
 * @swagger
 * tags:
 *   name: TikTok
 *   description: TikTok Messaging Integration API
 */

/**
 * @swagger
 * /tiktok/webhook:
 *   post:
 *     summary: Receive TikTok message webhooks
 *     tags: [TikTok]
 *     responses:
 *       200:
 *         description: Event acknowledged
 */
router.post('/webhook', (req, res) => controller.handleWebhook(req, res));
router.get('/callback', (req, res) => controller.handleCallback(req, res));

/**
 * @swagger
 * /tiktok/send:
 *   post:
 *     summary: Send a TikTok DM
 *     tags: [TikTok]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post('/send', authMiddleware, (req, res) => controller.sendMessage(req, res));
router.get('/conversations', authMiddleware, (req, res) => controller.getConversations(req, res));
router.get('/messages/:id', authMiddleware, (req, res) => controller.getMessages(req, res));
router.put('/conversations/:id/update-ai', authMiddleware, (req, res) => controller.toggleAI(req, res));

// Debug endpoint: Get TikTok OAuth authorization URL
router.get('/debug/auth-url', (req, res) => {
  try {
    const authUrl = TikTokOAuthHelper.generateAuthorizationUrl();
    res.json({
      status: 'success',
      message: 'Visit this URL to authorize TikTok with Lock n More',
      authUrl,
      instructions: [
        '1. Click the authUrl link above',
        '2. Log into TikTok and authorize the app',
        '3. You will be redirected to /tiktok/callback with an authorization code',
        '4. The access token will be displayed in the console',
        '5. Copy the access token and add it to .env.local as TIKTOK_ACCESS_TOKEN'
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Debug endpoint: Refresh client credentials token (no browser needed)
router.get('/debug/refresh-token', async (req, res) => {
  try {
    const token = await controller.service.refreshClientToken();
    res.json({
      status: 'success',
      message: 'Client credentials token refreshed successfully',
      tokenPreview: token.substring(0, 20) + '...',
      expiresIn: '2 hours',
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export const tiktokRoutes = router;
