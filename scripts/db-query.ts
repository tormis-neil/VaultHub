import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function runQuery() {
  const query = process.argv.slice(2).join(' ') || 'SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\';';

  const pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`\n[Executing Query on Cloud SQL]: ${query}\n`);
    const result = await pool.query(query);
    if (result.rows && result.rows.length > 0) {
      console.table(result.rows);
      console.log(`Rows returned: ${result.rowCount}\n`);
    } else {
      console.log(`Query executed successfully. (0 rows / ${result.command})\n`);
    }
  } catch (err: any) {
    console.error('\nSQL Query Error:', err.message);
  } finally {
    await pool.end();
  }
}

runQuery();
