# Shutter & Lace

## Run locally (SQLite, nothing to set up)
1. `npm install`
2. `npm run dev`
3. Open the Computer or Phone link it prints.

The database is created automatically at `data/shop.db`. Delete that file to reset all accounts.

## Deploy with PostgreSQL
Set these environment variables on your host:
- `DB_CLIENT=postgres`
- `DATABASE_URL=postgres://user:password@host:5432/dbname`
- `JWT_SECRET=<long random string>`
- `NODE_ENV=production`

Then run `schema.sql` once on the Postgres database. Queries use `?` placeholders in `db.js`, which converts them for Postgres.
