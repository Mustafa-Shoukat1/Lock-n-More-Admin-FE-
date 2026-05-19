import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Real-time notification management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get paginated notifications
 *     tags: [Notifications]
 */
router.get('/', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => notificationController.getNotifications(req, res));

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a notification (Internal/Test)
 *     tags: [Notifications]
 */
router.post('/', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => notificationController.createNotification(req, res));

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 */
router.put('/:id/read', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => notificationController.markAsRead(req, res));

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 */
router.put('/read-all', authMiddleware, requireRole('agent', 'admin', 'super_admin'), (req, res) => notificationController.markAllAsRead(req, res));

export const notificationRoutes = router;
