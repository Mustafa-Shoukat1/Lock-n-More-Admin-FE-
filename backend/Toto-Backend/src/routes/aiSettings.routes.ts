import { Router } from 'express';
import { AISettingsController } from '../controllers/aiSettings.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const controller = new AISettingsController();

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), controller.getSettings);
router.patch('/:id/select', authMiddleware, requireRole('admin', 'super_admin'), controller.selectSetting);
router.patch('/:id', authMiddleware, requireRole('admin', 'super_admin'), controller.updateSetting);

export { router as aiSettingsRoutes };
