import { Router } from 'express';
import { AgentPerformanceController } from '../controllers/agentPerformance.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const controller = new AgentPerformanceController();

/**
 * @swagger
 * tags:
 *   name: Performance
 *   description: Agent Performance Tracking API
 */

/**
 * @swagger
 * /performance/agents:
 *   get:
 *     summary: Get aggregated agent performance metrics
 *     tags: [Performance]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of agent performance metrics
 */
router.get('/agents', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => controller.getAgentPerformance(req, res));

/**
 * @swagger
 * /performance/agents/{userId}/history:
 *   get:
 *     summary: Get daily performance history for a specific agent
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily history of performance
 */
router.get('/agents/:userId/history', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => controller.getAgentHistory(req, res));

export const agentPerformanceRoutes = router;
