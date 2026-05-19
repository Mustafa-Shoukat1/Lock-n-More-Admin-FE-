import express, { Router } from 'express';
import { StripeWebhookController } from '../controllers/stripeWebhook.controller';

const router = Router();
const webhookController = new StripeWebhookController();

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe Payment Integration
 */

/**
 * @swagger
 * /webhook/stripe:
 *   post:
 *     summary: Handle Stripe Webhooks
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

export const stripeRoutes = router;
