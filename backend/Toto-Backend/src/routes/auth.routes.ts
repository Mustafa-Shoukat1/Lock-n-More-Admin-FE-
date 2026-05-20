import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// ── Brute-force protection: 10 attempts per 15 min per IP ──────────────────
const _loginAttempts = new Map<string, { count: number; resetAt: number }>();
const loginRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  const ip = (forwarded?.split(',').shift()?.trim()) ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const WINDOW_MS = 15 * 60 * 1000;
  const MAX = 10;
  let entry = _loginAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    _loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  entry.count += 1;
  if (entry.count > MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes.' });
    return;
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginRateLimit, (req, res) => authController.login(req, res));

export const authRoutes = router;
