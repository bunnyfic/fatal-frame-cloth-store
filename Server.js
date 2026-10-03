require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const db = require('./db');
const PRODUCTS = require('./products');
const SECRET = process.env.JWT_SECRET || 'dev-only-secret';

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function setSession(res, user) {
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
  res.cookie('ff_token', token, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 3600 * 1000,
  });
}

function auth(req, res, next) {
  try { req.user = jwt.verify(req.cookies.ff_token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Please log in.' }); }
}

// Temporary diagnostic: open /api/health to see whether the database connects. Delete once everything works.
app.get('/api/health', async (req, res) => {
  const info = { db_client: process.env.DB_CLIENT || 'sqlite', has_database_url: !!process.env.DATABASE_URL, has_jwt_secret: !!process.env.JWT_SECRET };
  try {
    await db.query('SELECT 1 FROM users LIMIT 1');
    res.json({ ...info, ok: true });
  } catch (err) {
    res.status(500).json({ ...info, ok: false, error: err.message });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username = '', email = '', password = '' } = req.body;
  if (username.trim().length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters.' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING id, username',
      [username.trim(), email.trim().toLowerCase(), hash]
    );
    setSession(res, rows[0]);
    res.status(201).json({ ok: true, redirect: '/profile-setup.html' });
  } catch (err) {
    if (db.isUnique(err)) return res.status(409).json({ error: 'An account with this email already exists.' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email = '', password = '' } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    setSession(res, user);
    res.json({ ok: true, redirect: user.profile_complete ? '/shop.html' : '/profile-setup.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

app.post('/api/logout', (req, res) => { res.clearCookie('ff_token'); res.json({ ok: true }); });

app.get('/api/me', (req, res) => {
  try {
    const u = jwt.verify(req.cookies.ff_token, SECRET);
    res.json({ user: { id: u.id, username: u.username } });
  } catch { res.json({ user: null }); }
});

app.get('/api/profile', auth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT username, email, full_name, phone, address, city, postal_code, country, photo, profile_complete, created_at
     FROM users WHERE id = ?`, [req.user.id]);
  if (!rows[0]) return res.status(401).json({ error: 'Please log in.' });
  res.json(rows[0]);
});

app.put('/api/profile', auth, async (req, res) => {
  const t = (k) => String(req.body[k] || '').trim();
  const f = { full_name: t('full_name'), username: t('username'), phone: t('phone'), address: t('address'),
              city: t('city'), postal_code: t('postal_code'), country: t('country') };
  const photo = String(req.body.photo || '');

  if (f.full_name.length < 2) return res.status(400).json({ error: 'Enter your full name.' });
  if (f.username.length < 2 || f.username.length > 40) return res.status(400).json({ error: 'Username must be 2 to 40 characters.' });
  if (!/^\+?[\d\s\-().]{7,20}$/.test(f.phone)) return res.status(400).json({ error: 'Enter a valid phone number.' });
  if (!f.address || !f.city || !f.postal_code || !f.country) return res.status(400).json({ error: 'Complete every address field.' });
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo) || photo.length > 500000)
    return res.status(400).json({ error: 'Add a profile photo.' });

  try {
    await db.query(
      `UPDATE users SET full_name=?, username=?, phone=?, address=?, city=?, postal_code=?,
       country=?, photo=?, profile_complete=true WHERE id=?`,
      [f.full_name, f.username, f.phone, f.address, f.city, f.postal_code, f.country, photo, req.user.id]);
    setSession(res, { id: req.user.id, username: f.username });
    res.json({ ok: true, redirect: '/shop.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});


// ---- shop ----
const FREE_SHIPPING_OVER = 8000, SHIPPING_FEE = 600; // cents

app.get('/api/products', (req, res) => res.json(PRODUCTS));

app.post('/api/orders', auth, async (req, res) => {
  const { items, shipping = {} } = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 30)
    return res.status(400).json({ error: 'Your bag is empty.' });

  const lines = []; let subtotal = 0;
  for (const it of items) {
    const p = PRODUCTS.find((x) => x.id === it.id);
    const qty = parseInt(it.qty, 10);
    if (!p || !p.sizes.includes(it.size) || !(qty >= 1 && qty <= 10))
      return res.status(400).json({ error: 'An item in your bag is no longer available.' });
    lines.push({ id: p.id, name: p.name, size: it.size, qty, price: p.price });
    subtotal += p.price * qty;
  }
  const s = (k) => String(shipping[k] || '').trim();
  const ship = { name: s('name'), phone: s('phone'), address: s('address'), city: s('city'), postal: s('postal'), country: s('country') };
  if (ship.name.length < 2) return res.status(400).json({ error: 'Enter the recipient name.' });
  if (!/^\+?[\d\s\-().]{7,20}$/.test(ship.phone)) return res.status(400).json({ error: 'Enter a valid phone number.' });
  if (!ship.address || !ship.city || !ship.postal || !ship.country) return res.status(400).json({ error: 'Complete every address field.' });

  const shippingFee = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  try {
    const { rows } = await db.query(
      `INSERT INTO orders (user_id, items, subtotal, shipping, total, ship_name, ship_phone, ship_address,
        ship_city, ship_postal, ship_country, payment_method) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`,
      [req.user.id, JSON.stringify(lines), subtotal, shippingFee, subtotal + shippingFee, ship.name, ship.phone,
       ship.address, ship.city, ship.postal, ship.country, 'cash_on_delivery']);
    res.status(201).json({ ok: true, orderId: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not place your order. Try again.' });
  }
});

app.get('/api/orders', auth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, items, total, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
  res.json(rows.map((r) => ({ ...r, items: JSON.parse(r.items) })));
});

const os = require('os');
const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(os.networkInterfaces()).flat()
    .filter((n) => n.family === 'IPv4' && !n.internal && !/^169\.254\./.test(n.address))
    .map((n) => n.address);
  console.log('\n  Shutter & Lace is running\n');
  console.log('  Computer:  http://localhost:' + PORT);
  if (lan.length) lan.forEach((ip) => console.log('  Phone:     http://' + ip + ':' + PORT));
  else console.log('  Phone:     (no Wi-Fi network found)');
  console.log('\n  Phone must be on the same Wi-Fi as this computer.\n');
});

// Vercel imports the app; locally `node server.js` starts it.
module.exports = app;
