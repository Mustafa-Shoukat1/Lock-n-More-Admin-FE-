import express from 'express';
import { notificationRoutes } from './routes/notification.routes';
import { aiRoutes } from './routes/ai.routes';
import { aiSettingsRoutes } from './routes/aiSettings.routes';
import cors from 'cors'; // Import cors
import { shopifyRoutes } from './routes/shopify.routes';
import { whatsappRoutes } from './routes/whatsapp.routes';
import { instagramRoutes } from './routes/instagram.routes';
import { tiktokRoutes } from './routes/tiktok.routes';
import { stripeRoutes } from './routes/stripe.routes';
import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';

import helmet from 'helmet';
import compression from 'compression';

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean) as string[];

// Trust proxy (required for DigitalOcean / Nginx / Cloudflare)
app.set('trust proxy', 1);

// Production hardening
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
}));

// Stripe Webhook needs raw body - must be before express.json()
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Global request logger
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

import { healthRoutes } from './routes/health.routes';

import { agentPerformanceRoutes } from './routes/agentPerformance.routes';
import { followupRoutes } from './routes/followup.routes';

// Routes
app.use('/health', healthRoutes);
app.use('/shopify', shopifyRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/instagram', instagramRoutes);
app.use('/tiktok', tiktokRoutes);
app.use('/stripe', stripeRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai', aiRoutes);
app.use('/ai-settings', aiSettingsRoutes);
app.use('/performance', agentPerformanceRoutes); // Register performance routes
app.use('/followup', followupRoutes); // Register follow-up routes
app.use(express.static(path.join(__dirname, '../public')));

// Base route
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'TOTO Backend API is running' });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(errorHandler);

export default app;
