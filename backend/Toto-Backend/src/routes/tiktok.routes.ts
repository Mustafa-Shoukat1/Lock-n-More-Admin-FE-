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
        '3. After authorization, TikTok redirects to toto.locksnmore.com.my with ?code=XXXX in the URL',
        '4. Copy the "code" value from your browser address bar',
        '5. Visit /tiktok/debug/exchange-code?code=PASTE_CODE_HERE to get your access token'
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Debug endpoint: Manually exchange an authorization code for access token
router.get('/debug/exchange-code', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: 'Provide ?code=YOUR_AUTH_CODE' });
    }
    const tokenData = await controller.service.getAccessToken(code);
    console.log('✅ TikTok token exchanged:', tokenData);
    res.json({
      status: 'success',
      message: 'Token exchanged! Update TIKTOK_ACCESS_TOKEN with the access_token below.',
      tokenData
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export const tiktokRoutes = router;
