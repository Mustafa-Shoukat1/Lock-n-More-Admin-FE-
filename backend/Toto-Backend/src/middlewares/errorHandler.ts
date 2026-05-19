import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', err);

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        meta: process.env.NODE_ENV === 'development' ? err : undefined,
    });
};
