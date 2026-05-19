import { Router } from 'express';
import * as ShopifyController from '../controllers/shopify.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Shopify
 *   description: Shopify Integration API
 */

/**
 * @swagger
 * /shopify/ping:
 *   get:
 *     summary: Ping Shopify Store
 *     tags: [Shopify]
 *     responses:
 *       200:
 *         description: Successful ping
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shop:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/ping', authMiddleware, requireRole('admin', 'super_admin'), ShopifyController.ping);

/**
 * @swagger
 * /shopify/products:
 *   post:
 *     summary: Sync batch of Shopify products
 *     tags: [Shopify]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       200:
 *         description: Sync successful
 *       500:
 *         description: Server error
 */
router.post('/products', authMiddleware, requireRole('admin', 'super_admin'), ShopifyController.syncProducts);

/**
 * @swagger
 * /shopify/products:
 *   get:
 *     summary: Get all stored products
 *     tags: [Shopify]
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Server error
 */
router.get('/products', authMiddleware, requireRole('admin', 'super_admin'), ShopifyController.getProducts);

router.get('/orders', authMiddleware, requireRole('admin', 'super_admin'), ShopifyController.getOrders);

export const shopifyRoutes = router;
