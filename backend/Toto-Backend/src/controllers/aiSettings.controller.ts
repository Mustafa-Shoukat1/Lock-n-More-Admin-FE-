import { Request, Response } from 'express';
import pool from '../config/db.config';

export class AISettingsController {

    // Get all AI settings
    async getSettings(req: Request, res: Response) {
        try {
            const result = await pool.query('SELECT * FROM ai_settings ORDER BY id ASC');
            res.status(200).json(result.rows);
        } catch (error: any) {
            console.error('Error fetching AI settings:', error.message);
            res.status(500).json({ error: 'Failed to fetch AI settings' });
        }
    }

    // Select active setting
    async selectSetting(req: Request, res: Response) {
        const { id } = req.params;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Deactivate all
            await client.query('UPDATE ai_settings SET is_active = FALSE');

            // Activate selected
            const result = await client.query(
                'UPDATE ai_settings SET is_active = TRUE WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ error: 'Setting not found' });
                return;
            }

            await client.query('COMMIT');
            res.status(200).json(result.rows[0]);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error selecting AI setting:', error.message);
            res.status(500).json({ error: 'Failed to select AI setting' });
        } finally {
            client.release();
        }
    }

    // Update setting details
    async updateSetting(req: Request, res: Response) {
        const { id } = req.params;
        const { prompt, description } = req.body;

        try {
            const result = await pool.query(
                `UPDATE ai_settings 
                 SET prompt = COALESCE($1, prompt), 
                     description = COALESCE($2, description),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3 
                 RETURNING *`,
                [prompt, description, id]
            );

            if (result.rowCount === 0) {
                res.status(404).json({ error: 'Setting not found' });
                return;
            }

            res.status(200).json(result.rows[0]);
        } catch (error: any) {
            console.error('Error updating AI setting:', error.message);
            res.status(500).json({ error: 'Failed to update AI setting' });
        }
    }
}
