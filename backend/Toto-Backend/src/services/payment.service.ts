import Stripe from 'stripe';

export class PaymentService {
  private stripe: any;

  constructor() {
    this.stripe = null;
  }

  private getStripeClient(): any {
    if (this.stripe) {
      return this.stripe;
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Stripe is not configured. Missing STRIPE_SECRET_KEY.');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27' as any,
    });

    return this.stripe;
  }

  async createCheckoutSession(params: {
    orderId: number;
    productId: number;
    variantId: number;
    userId: string;
    platform: string;
    productTitle: string;
    variantTitle: string;
    price: number;
    currency?: string;
    imageUrl?: string;
  }) {
    const { 
      orderId, productId, variantId, userId, platform, 
      productTitle, variantTitle, price, currency = 'usd', imageUrl 
    } = params;

    try {
      if (!price || price <= 0) {
        throw new Error('Invalid price: Price must be greater than zero.');
      }

      console.log(`💳 Creating Stripe session for Order ${orderId} (${platform} user ${userId})`);

      const stripe = this.getStripeClient();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], // Can be expanded or set to automatic
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `${productTitle}`,
                description: `Variant: ${variantTitle}`,
                images: imageUrl ? [imageUrl] : [],
              },
              unit_amount: Math.round(price * 100), // Stripe expects amounts in cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: String(orderId),
          productId: String(productId),
          variantId: String(variantId),
          userId: String(userId),
          platform: String(platform),
        },
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled?order_id=${orderId}`,
      });

      return session;
    } catch (error: any) {
      console.error('❌ Failed to create Stripe Checkout Session:', error.message);
      throw error;
    }
  }

  async verifyWebhookSignature(payload: string | Buffer, signature: string) {
    try {
      const stripe = this.getStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('Stripe webhook verification is not configured. Missing STRIPE_WEBHOOK_SECRET.');
      }

      return stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (error: any) {
      console.error('❌ Stripe Webhook Signature Verification Failed:', error.message);
      throw error;
    }
  }
}
