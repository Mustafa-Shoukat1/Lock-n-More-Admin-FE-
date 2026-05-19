import pool from '../config/db.config';

export interface CreateNotificationDTO {
    type: 'lead' | 'order' | 'system' | 'alert' | 'message';
    title: string;
    message: string;
    link?: string;
    conversation_id?: string;
}

export class NotificationService {

    async createNotification(data: CreateNotificationDTO) {
        try {
            const query = `
                INSERT INTO notifications (type, title, message, link, conversation_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const result = await pool.query(query, [
                data.type,
                data.title,
                data.message,
                data.link || null,
                data.conversation_id || null
            ]);

            const notification = result.rows[0];

            // Emit to Socket.IO if available
            if ((global as any).io) {
                console.log('🔔 Emitting new_notification:', notification.id);
                (global as any).io.emit('new_notification', notification);
            }

            return notification;
        } catch (error: any) {
            console.error('Error creating notification:', error.message);
            throw error;
        }
    }

    async getNotifications(limit: number = 20, offset: number = 0) {
        try {
            const query = `
                SELECT * FROM notifications
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            `;
            const result = await pool.query(query, [limit, offset]);
            return result.rows;
        } catch (error: any) {
            console.error('Error fetching notifications:', error.message);
            throw error;
        }
    }

    async markAsRead(id: string) {
        try {
            if (!id || id.length !== 36) { // Basic UUID length check or use uuid.validate
                return null;
            }
            const query = `
                UPDATE notifications
                SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error: any) {
            console.error('Error marking notification as read:', error.message);
            throw error;
        }
    }

    async markAllAsRead() {
        try {
            const query = `
                UPDATE notifications
                SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE is_read = FALSE
                RETURNING id
            `;
            const result = await pool.query(query);
            return { updatedCount: result.rowCount };
        } catch (error: any) {
            console.error('Error marking all notifications as read:', error.message);
            throw error;
        }
    }

    async cleanupOldReadNotifications() {
        try {
            // Delete read notifications older than 24 hours
            const query = `
                DELETE FROM notifications 
                WHERE is_read = TRUE 
                AND updated_at < NOW() - INTERVAL '24 hours'
            `;
            const result = await pool.query(query);
            if (result.rowCount != null && result.rowCount > 0) {
                console.log(`🧹 Cleaned up ${result.rowCount} old read notifications.`);
            }
        } catch (error: any) {
            console.error('Error cleaning up old notifications:', error.message);
        }
    }
}
