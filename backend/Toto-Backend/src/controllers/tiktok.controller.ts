import { Request, Response } from 'express';
import { TikTokAdapter } from '../adapters/TikTokAdapter';
import { TikTokService } from '../services/tiktok.service';

export class TikTokController {
  private adapter: TikTokAdapter;
  public service: TikTokService;

  constructor() {
    this.adapter = new TikTokAdapter();
    this.service = new TikTokService();
  }

  /**
   * Handle incoming TikTok webhooks
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      // 1. Parse incoming payload
      const payload = this.adapter.parseIncoming(req);
      const { userId, message, timestamp } = payload;

      console.log(`📩 Received TikTok message from ${userId}: ${message}`);

      // 2. Persist contact and message
      await this.service.getOrCreateContact(userId);
      const session = await this.service.getOrCreateSession(userId);
      
      await this.service.saveMessage(userId, 'inbound', 'text', { text: message }, { session_id: session.id });

      // 3. Handle AI response (non-blocking)
      this.service.handleAIResponse(userId, message, session.id);

      // 4. Acknowledge receipt to TikTok
      res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      console.error('Webhook Error (TikTok):', error.message);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Manual send message endpoint
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: 'Missing "to" or "message" in request body' });
      }

      const user = (req as any).user;
      const result = await this.service.sendMessage(to, message, user?.id, user?.role);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Fetch all TikTok conversations
   */
  async getConversations(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.id || (req.query.userId ? Number(req.query.userId) : undefined);
      const role = user?.role || (req.query.role as string);

      const conversations = await this.service.getConversations(userId, role);
      res.status(200).json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Fetch message history for a specific TikTok user
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID (openId) is required' });

      const messages = await this.service.getMessageHistory(id as string);
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Toggle AI status for a TikTok chat
   */
  async toggleAI(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || status === undefined) {
        return res.status(400).json({ error: 'ID and status are required' });
      }

      const result = await this.service.updateAiStatus(id as string, status);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  /**
   * Handle TikTok OAuth Callback
   */
  async handleCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code is missing' });
      }

      console.log('🔄 TikTok OAuth Callback received. Exchanging code...');
      const tokenData = await this.service.getAccessToken(code as string);
      
      // In a real application, you would save tokenData (access_token, open_id, etc.) to your DB linked to the user
      console.log('✅ TikTok OAuth successful:', tokenData);

      // Redirect back to dashboard
      const dashboardUrl = `${process.env.FRONTEND_URL?.replace(/\/$/, '')}/#/inbox?connection=tiktok&status=success`;
      res.redirect(dashboardUrl);
    } catch (error: any) {
      console.error('TikTok OAuth Error:', error.message);
      const errorUrl = `${process.env.FRONTEND_URL?.replace(/\/$/, '')}/#/inbox?connection=tiktok&status=error&message=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  }
}
