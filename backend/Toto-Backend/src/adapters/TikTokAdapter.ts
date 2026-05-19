import { Request } from 'express';
import { MessagingAdapter, MessagePayload } from './MessagingAdapter';
import { TikTokService } from '../services/tiktok.service';

export class TikTokAdapter implements MessagingAdapter {
  private tiktokService: TikTokService;

  constructor() {
    this.tiktokService = new TikTokService();
  }

  parseIncoming(req: Request): MessagePayload {
    const { body } = req;
    
    // TikTok Webhook payload structure (simplified based on requirements)
    // Note: Actual TikTok payloads might vary, but we'll follow the requested normalization
    const data = body.data || body;
    const sender = data.sender || {};
    const message = data.message || {};

    return {
      platform: 'tiktok',
      userId: sender.open_id || data.open_id || 'unknown',
      message: message.text || data.text || '',
      timestamp: data.timestamp || Date.now(),
      rawPayload: body
    };
  }

  async sendMessage(userId: string, message: string): Promise<void> {
    await this.tiktokService.sendMessage(userId, message);
  }
}
