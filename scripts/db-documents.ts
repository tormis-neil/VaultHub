import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function showDocuments() {
  const pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('\n========================================================================================');
    console.log('       VAULTHUB LIVE CLOUD SQL DATABASE (PostgreSQL) - ENCRYPTED VAULT DOCUMENTS       ');
    console.log('========================================================================================\n');

    const result = await pool.query(`
      SELECT 
        d.id, 
        d.title, 
        d.category, 
        d.file_size_bytes || ' B' AS size,
        substring(d.checksum_sha256 from 1 for 16) || '...' AS sha256_hash,
        d.encryption_iv_hex AS nonce_iv_12b,
        d.encryption_tag_hex AS mac_tag_16b,
        substring(d.ciphertext_base64 from 1 for 24) || '...' AS ciphertext_sample
      FROM vault_documents d
      ORDER BY d.upload_date DESC;
    `);

    console.table(result.rows);
    console.log(`Total Stored Encrypted Documents: ${result.rowCount}`);
    console.log('\nCryptographic Standard: AES-256-GCM (Authenticated Encryption with Associated Data)');
    console.log('- Nonce / IV: 96-bit unique random vector per file');
    console.log('- Authentication Tag: 128-bit MAC verifying ciphertext integrity');
    console.log('- Fingerprint: SHA-256 (64 hex characters) cryptographic hash\n');
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await pool.end();
  }
}

showDocuments();
