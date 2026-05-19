import { config } from './config/env';
import app from './app';
import { logger } from './utils/logger';
import { initDb } from './utils/initDb';
import { UserService } from './services/user.service';
import { followupScheduler } from './services/followup.service';

import http from 'http';
import { Server } from 'socket.io';

const PORT = config.port;
const socketOrigins = [process.env.FRONTEND_URL].filter(Boolean) as string[];

const startServer = async () => {
    try {
        await initDb();
        const userService = new UserService();
        await userService.seedSuperAdmin();

        // Start follow-up scheduler (checks every 60 seconds for pending follow-ups)
        followupScheduler.startScheduler(60000);

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: socketOrigins.length > 0 ? socketOrigins : true,
                methods: ['GET', 'POST']
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        // Make io accessible globally
        (global as any).io = io;

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            socket.on('disconnect', (reason) => {
                console.log(`User disconnected: ${socket.id} Reason: ${reason}`);
            });
        });

        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Cleanup Job for Notifications (Run every hour)
import { NotificationService } from './services/notification.service';
const notificationService = new NotificationService();
setInterval(async () => {
    try {
        console.log('🧹 Running notification cleanup job...');
        await notificationService.cleanupOldReadNotifications();
    } catch (error) {
        console.error('Error in notification cleanup job:', error);
    }
}, 60 * 60 * 1000); // 1 hour

startServer();
