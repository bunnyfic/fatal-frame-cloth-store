CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(40)  NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- profile fields (safe to re-run on an existing database)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name        VARCHAR(120),
  ADD COLUMN IF NOT EXISTS phone            VARCHAR(30),
  ADD COLUMN IF NOT EXISTS address          VARCHAR(200),
  ADD COLUMN IF NOT EXISTS city             VARCHAR(80),
  ADD COLUMN IF NOT EXISTS postal_code      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS country          VARCHAR(80),
  ADD COLUMN IF NOT EXISTS photo            TEXT,
  ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  items          TEXT NOT NULL,
  subtotal       INTEGER NOT NULL,
  shipping       INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  ship_name      VARCHAR(120) NOT NULL,
  ship_phone     VARCHAR(30)  NOT NULL,
  ship_address   VARCHAR(200) NOT NULL,
  ship_city      VARCHAR(80)  NOT NULL,
  ship_postal    VARCHAR(20)  NOT NULL,
  ship_country   VARCHAR(80)  NOT NULL,
  payment_method VARCHAR(30)  NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'placed',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);