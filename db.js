// Database layer. Local development uses SQLite (no install needed).
// For deployment, set DB_CLIENT=postgres and DATABASE_URL in the environment.
// Write queries with ? placeholders; they are converted for Postgres automatically.
const fs = require('fs');
const path = require('path');

const client = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

if (client === 'postgres') {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  console.log('Database: PostgreSQL');
  module.exports = {
    async query(sql, params = []) {
      let i = 0;
      const { rows } = await pool.query(sql.replace(/\?/g, () => '$' + ++i), params);
      return { rows };
    },
    isUnique: (err) => err && err.code === '23505',
  };
} else {
  const { DatabaseSync } = require('node:sqlite'); // built into Node 22.13+, nothing to install
  const dir = path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'shop.db');
  const sqlite = new DatabaseSync(file);
  sqlite.exec(fs.readFileSync(path.join(__dirname, 'schema.sqlite.sql'), 'utf8'));
  console.log('Database: SQLite (' + file + ')');
  module.exports = {
    async query(sql, params = []) {
      return { rows: sqlite.prepare(sql).all(...params) };
    },
    isUnique: (err) => err && /UNIQUE constraint failed/i.test(err.message || ''),
  };
}