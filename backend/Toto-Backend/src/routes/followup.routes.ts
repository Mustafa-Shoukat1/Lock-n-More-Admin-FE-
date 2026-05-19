import { Router } from 'express';
import { FollowupController } from '../controllers/followup.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const controller = new FollowupController();

/**
 * Schedule a new follow-up
 * POST /followup/schedule
 * Body: { platform, sessionId, contactId, delayMinutes? }
 */
router.post('/schedule', authMiddleware, requireRole('admin', 'super_admin'), controller.scheduleFollowup.bind(controller));

/**
 * Cancel a follow-up
 * DELETE /followup/:id
 */
router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), controller.cancelFollowup.bind(controller));

/**
 * Get follow-up status for a session
 * GET /followup/status?platform=whatsapp&sessionId=123
 */
router.get('/status', authMiddleware, controller.getFollowupStatus.bind(controller));

/**
 * Get all active follow-ups
 * GET /followup/all
 */
router.get('/all', authMiddleware, requireRole('admin', 'super_admin'), controller.getAllFollowups.bind(controller));

/**
 * Update follow-up delay
 * PATCH /followup/:id/delay
 * Body: { delayMinutes }
 */
router.patch('/:id/delay', authMiddleware, requireRole('admin', 'super_admin'), controller.updateFollowupDelay.bind(controller));

/**
 * Get follow-up message templates
 * GET /followup/templates?platform=whatsapp
 */
router.get('/templates', authMiddleware, controller.getTemplates.bind(controller));

/**
 * Update follow-up message template
 * PATCH /followup/templates/:id
 * Body: { messageText }
 */
router.patch('/templates/:id', authMiddleware, requireRole('admin', 'super_admin'), controller.updateTemplate.bind(controller));

export { router as followupRoutes };
