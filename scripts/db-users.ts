import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function showUsers() {
  const pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('\n========================================================================================');
    console.log('              VAULTHUB LIVE CLOUD SQL DATABASE (PostgreSQL) - USERS TABLE              ');
    console.log('========================================================================================\n');

    const result = await pool.query(`
      SELECT 
        id, 
        student_id, 
        full_name, 
        email, 
        substring(password_hash from 1 for 24) || '...' AS password_hash_sample,
        password_salt,
        degree_program
      FROM users 
      ORDER BY id;
    `);

    console.table(result.rows);
    console.log(`Total Stored Student Accounts: ${result.rowCount}`);
    console.log('\nCryptographic Standard: PBKDF2 with 100,000 iterations of SHA-256 + 128-bit random salt.');
    console.log('Passwords are one-way hashed and salted; plaintext credentials cannot be recovered.\n');
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await pool.end();
  }
}

showUsers();
