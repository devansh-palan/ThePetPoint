import pool from './src/db/index';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  try {
    const file1 = fs.readFileSync(path.join(__dirname, 'src/db/migrations/001_create_tables.sql'), 'utf-8');
    const file2 = fs.readFileSync(path.join(__dirname, 'src/db/migrations/002_add_event_approval.sql'), 'utf-8');

    console.log('Running 001_create_tables.sql...');
    await pool.query(file1);
    
    console.log('Running 002_add_event_approval.sql...');
    await pool.query(file2);

    console.log('Migrations complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
