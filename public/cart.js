const money = (c) => '$' + (c / 100).toFixed(2).replace(/\.00$/, '');
const Cart = {
  key: 'ff_cart',
  get() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(c) { localStorage.setItem(this.key, JSON.stringify(c)); document.dispatchEvent(new Event('cart')); },
  add(id, size, qty = 1) {
    const c = this.get(), l = c.find((x) => x.id === id && x.size === size);
    if (l) l.qty = Math.min(10, l.qty + qty); else c.push({ id, size, qty });
    this.save(c);
  },
  setQty(id, size, qty) {
    const c = this.get().map((x) => (x.id === id && x.size === size ? { ...x, qty } : x)).filter((x) => x.qty > 0);
    this.save(c);
  },
  clear() { this.save([]); },
  count() { return this.get().reduce((n, x) => n + x.qty, 0); },
};
const FREE_SHIPPING_OVER = 8000, SHIPPING_FEE = 600;
function placeholder() { const d = document.createElement('div'); d.className = 'ph'; d.textContent = 'Photo coming soon'; return d; }