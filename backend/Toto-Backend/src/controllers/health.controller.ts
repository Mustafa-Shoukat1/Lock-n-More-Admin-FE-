import { Request, Response } from 'express';
import pool from '../config/db.config';

export class HealthController {
    async check(req: Request, res: Response) {
        try {
            // Check DB connection
            const client = await pool.connect();
            try {
                await client.query('SELECT 1');
            } finally {
                client.release();
            }

            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services: {
                    database: 'connected'
                }
            });
        } catch (error: any) {
            console.error('Health check failed:', error);
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }
}
