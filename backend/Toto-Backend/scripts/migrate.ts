import pool from '../src/config/db.config';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  console.log(`🚀 Starting database migration on Neon...`);
  
  for (const file of files) {
    console.log(`📄 Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      await pool.query(sql);
      console.log(`✅ ${file} applied successfully.`);
    } catch (err: any) {
      console.error(`❌ Error applying ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log('🏁 Migration process completed.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
