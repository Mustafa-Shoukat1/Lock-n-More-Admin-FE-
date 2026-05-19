import fs from 'fs';
import path from 'path';
import pool from '../src/config/db.config';

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/performance_tracking_setup.sql');
        console.log(`Reading migration file from ${migrationPath}...`);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await pool.query(sql);
        console.log('✅ Migration executed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
