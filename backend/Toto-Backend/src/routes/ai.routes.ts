import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AIController();

router.post('/suggest', authMiddleware, (req, res) => controller.suggest(req, res));
router.post('/sentiment', authMiddleware, (req, res) => controller.sentiment(req, res));

export { router as aiRoutes };