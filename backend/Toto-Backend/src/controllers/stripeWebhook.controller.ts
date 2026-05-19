import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';
import { ShopifyService } from '../services/shopify.service';
import { logger } from '../utils/logger';

// We might need to import WhatsAppService/InstagramService/TikTokService for confirmation
import { WhatsAppService } from '../services/whatsapp.service';
import { InstagramService } from '../services/instagram.service';
import { TikTokService } from '../services/tiktok.service';

export class StripeWebhookController {
  private paymentService: PaymentService;
  private orderService: OrderService;
  private shopifyService: ShopifyService;

  constructor() {
    this.paymentService = new PaymentService();
    this.orderService = new OrderService();
    this.shopifyService = new ShopifyService();
  }

  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = await this.paymentService.verifyWebhookSignature(req.body, signature);
    } catch (err: any) {
      logger.error('⚠️ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const { orderId, productId, variantId, userId, platform } = session.metadata;

      logger.info(`✅ Payment completed for Order: ${orderId}, User: ${userId}, Platform: ${platform}`);

      try {
        // 1. Update internal order status
        await this.orderService.updateOrderStatus(
          parseInt(orderId), 
          'paid', 
          session.id, 
          session.payment_intent
        );

        // 2. Fetch full order for Shopify sync
        const order = await this.orderService.getOrder(parseInt(orderId));

        // 3. Create order in Shopify
        await (this.shopifyService as any).createOrder({
          variantId: parseInt(variantId),
          quantity: order.quantity,
          customerIdentifier: userId, // Assuming user_id can be mapped
          note: `Paid via Stripe (Session: ${session.id})`
        });

        // 4. Send confirmation message via appropriate platform
        await this.sendConfirmation(userId, platform, `✅ Payment received! Your order for ${orderId} has been confirmed. We'll start processing it immediately.`);

      } catch (error: any) {
        logger.error('Error processing successful payment event:', error.message);
        // We still return 200 to Stripe but log the internal failure for manual fixing
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as any;
      const { orderId, userId, platform } = session.metadata;
      
      await this.orderService.updateOrderStatus(parseInt(orderId), 'failed');
      
      await this.sendConfirmation(userId, platform, `⚠️ It looks like your payment session expired. Would you like me to send a new checkout link?`);
    }

    res.status(200).json({ received: true });
  }

  private async sendConfirmation(userId: string, platform: string, message: string) {
    try {
      if (platform === 'whatsapp') {
        const ws = new WhatsAppService();
        await ws.sendMessage(userId, undefined, 'en', message);
      } else if (platform === 'instagram') {
        const is = new InstagramService();
        await is.sendMessage(userId, message);
      } else if (platform === 'tiktok') {
        const ts = new TikTokService();
        await ts.sendMessage(userId, message);
      }
    } catch (err: any) {
      logger.error(`Failed to send confirmation to ${userId} on ${platform}:`, err.message);
    }
  }
}
