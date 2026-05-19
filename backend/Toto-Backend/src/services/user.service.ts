import pool from '../config/db.config';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';

export class UserService {
    private readonly saltRounds = 10;

    async createUser(user: User): Promise<User> {
        const client = await pool.connect();
        try {
            const hashedPassword = await bcrypt.hash(user.password!, this.saltRounds);

            const query = `
                INSERT INTO users (name, email, role, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, email, role, created_at
            `;
            const values = [user.name, user.email, user.role, hashedPassword];

            const result = await client.query(query, values);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getUsers(): Promise<User[]> {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT id, name, email, role, created_at FROM users');
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getUserById(id: number): Promise<User | null> {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async updateUser(id: number, user: Partial<User>): Promise<User | null> {
        const client = await pool.connect();
        try {
            let query = 'UPDATE users SET ';
            const values: any[] = [];
            let i = 1;

            if (user.name) {
                query += `name = $${i++}, `;
                values.push(user.name);
            }
            if (user.email) {
                query += `email = $${i++}, `;
                values.push(user.email);
            }
            if (user.role) {
                query += `role = $${i++}, `;
                values.push(user.role);
            }
            if (user.password) {
                const hashedPassword = await bcrypt.hash(user.password, this.saltRounds);
                query += `password = $${i++}, `;
                values.push(hashedPassword);
            }

            // Remove trailing comma
            query = query.slice(0, -2);
            query += ` WHERE id = $${i} RETURNING id, name, email, role, created_at`;
            values.push(id);

            const result = await client.query(query, values);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        const client = await pool.connect();
        try {
            const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
            return (result.rowCount ?? 0) > 0;
        } finally {
            client.release();
        }
    }

    async seedSuperAdmin(): Promise<void> {
        const client = await pool.connect();
        try {
            const checkQuery = "SELECT * FROM users WHERE role = 'super_admin'";
            const checkResult = await client.query(checkQuery);

            if (checkResult.rows.length === 0) {
                console.log('Seeding Super Admin...');
                const hashedPassword = await bcrypt.hash('password', this.saltRounds);

                const insertQuery = `
                    INSERT INTO users (name, email, role, password)
                    VALUES ($1, $2, $3, $4)
                `;
                const values = ['Super Admin', 'admin@example.com', 'super_admin', hashedPassword]; // Using dummy email for seed

                await client.query(insertQuery, values);
                console.log('Super Admin seeded successfully.');
            } else {
                console.log('Super Admin already exists.');
            }
        } catch (error) {
            console.error('Error seeding Super Admin:', error);
        } finally {
            client.release();
        }
    }
}
