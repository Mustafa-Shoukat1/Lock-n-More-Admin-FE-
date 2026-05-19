import express, { Router } from 'express';
import { StripeWebhookController } from '../controllers/stripeWebhook.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';

const router = Router();
const webhookController = new StripeWebhookController();
const paymentService = new PaymentService();
const orderService = new OrderService();

router.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

// Create a Stripe checkout session
router.post('/checkout', authMiddleware, async (req: any, res: any) => {
    try {
        const { productId, variantId, price, productTitle, variantTitle, platform, imageUrl, currency } = req.body;
        const user = (req as any).user;

        if (!productId || !variantId || !price || !productTitle) {
            return res.status(400).json({ error: 'Missing required fields: productId, variantId, price, productTitle' });
        }

        // Create internal order record
        const order = await orderService.createOrder({
            userId: String(user.id),
            platform: platform || 'whatsapp',
            productId: Number(productId),
            variantId: Number(variantId),
            price: Number(price),
        });

        // Create Stripe checkout session
        const session = await paymentService.createCheckoutSession({
            orderId: order.id,
            productId: Number(productId),
            variantId: Number(variantId),
            userId: String(user.id),
            platform: platform || 'whatsapp',
            productTitle,
            variantTitle: variantTitle || 'Default',
            price: Number(price),
            currency: currency || 'myr',
            imageUrl,
        });

        res.status(200).json({ url: session.url, orderId: order.id });
    } catch (error: any) {
        if (error.message?.includes('not configured') || error.message?.includes('Missing STRIPE')) {
            return res.status(503).json({ error: 'Payment processing not configured. Contact administrator.' });
        }
        res.status(500).json({ error: error.message });
    }
});

export const stripeRoutes = router;
