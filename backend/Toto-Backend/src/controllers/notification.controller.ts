import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export class NotificationController {

    async getNotifications(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const offset = req.query.offset ? Number(req.query.offset) : 0;
            const notifications = await notificationService.getNotifications(limit, offset);
            res.status(200).json(notifications);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Mainly for testing or internal triggers via API
    async createNotification(req: Request, res: Response) {
        try {
            const { type, title, message, link, conversation_id } = req.body;
            if (!type || !title || !message) {
                return res.status(400).json({ error: 'Missing required fields: type, title, message' });
            }
            const notification = await notificationService.createNotification({
                type, title, message, link, conversation_id
            });
            res.status(201).json(notification);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ error: 'ID is required' });

            const result = await notificationService.markAsRead(id as string);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const result = await notificationService.markAllAsRead();
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
