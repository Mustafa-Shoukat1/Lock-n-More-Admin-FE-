import pool from '../config/db.config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export class AuthService {
    private readonly jwtSecret: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'secret';
    }

    async login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> } | null> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await client.query(query, [email]);
            const user = result.rows[0];

            if (!user) {
                return null;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return null;
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            // Remove password from user object
            const { password: _, ...userWithoutPassword } = user;

            return { token, user: userWithoutPassword };
        } finally {
            client.release();
        }
    }
}
