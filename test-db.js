require('dotenv').config();
const { Pool } = require('pg');
new Pool({ connectionString: process.env.DATABASE_URL })
  .query('SELECT COUNT(*) FROM users')
  .then(r => console.log('Connected. Users:', r.rows[0].count))
  .catch(e => console.log('Problem:', e.message))
  .finally(() => process.exit());