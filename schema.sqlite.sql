CREATE TABLE IF NOT EXISTS users (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  username         TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  full_name        TEXT,
  phone            TEXT,
  address          TEXT,
  city             TEXT,
  postal_code      TEXT,
  country          TEXT,
  photo            TEXT,
  profile_complete INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  items          TEXT NOT NULL,
  subtotal       INTEGER NOT NULL,
  shipping       INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  ship_name      TEXT NOT NULL,
  ship_phone     TEXT NOT NULL,
  ship_address   TEXT NOT NULL,
  ship_city      TEXT NOT NULL,
  ship_postal    TEXT NOT NULL,
  ship_country   TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'placed',
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);