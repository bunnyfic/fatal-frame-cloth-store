// Shared bag drawer + toast for shop and product pages. Call initBag(products) once products are loaded.
function initBag(products) {
  document.body.insertAdjacentHTML('beforeend',
    '<div class="scrim" id="scrim"></div><aside class="drawer" id="drawer" aria-label="Shopping bag">' +
    '<div class="drawer-head"><h2>Your bag</h2><button class="x" id="close" aria-label="Close bag">&times;</button></div>' +
    '<div class="drawer-items" id="items"></div><div class="drawer-foot" id="foot"></div></aside>' +
    '<div class="toast" id="toast" role="status"></div>');
  const el = (id) => document.getElementById(id);
  const byId = (id) => products.find((p) => p.id === id);

  window.toast = (t) => {
    const e = el('toast'); e.textContent = t; e.classList.add('show');
    clearTimeout(window.toast.t); window.toast.t = setTimeout(() => e.classList.remove('show'), 1800);
  };
  const openBag = () => { el('drawer').classList.add('open'); el('scrim').classList.add('show'); };
  const closeBag = () => { el('drawer').classList.remove('open'); el('scrim').classList.remove('show'); };

  function render() {
    const count = el('count'); if (count) count.textContent = Cart.count();
    const items = el('items'), foot = el('foot'); items.textContent = ''; foot.textContent = '';
    const lines = Cart.get().filter((l) => byId(l.id));
    if (!lines.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Your bag is empty.'; items.append(p); return; }
    let subtotal = 0;
    for (const l of lines) {
      const p = byId(l.id); subtotal += p.price * l.qty;
      const r = document.createElement('div'); r.className = 'line';
      const t = document.createElement('div');
      const n = document.createElement('strong'); n.textContent = p.name;
      const s = document.createElement('span'); s.textContent = 'Size ' + l.size + ' \u00b7 ' + money(p.price);
      t.append(n, s);
      const q = document.createElement('div'); q.className = 'qty';
      const mk = (txt, fn, label) => { const b = document.createElement('button'); b.textContent = txt; b.setAttribute('aria-label', label); b.onclick = fn; return b; };
      const num = document.createElement('span'); num.textContent = l.qty;
      q.append(mk('\u2212', () => Cart.setQty(l.id, l.size, l.qty - 1), 'Decrease'), num,
               mk('+', () => Cart.setQty(l.id, l.size, Math.min(10, l.qty + 1)), 'Increase'));
      r.append(t, q); items.append(r);
    }
    const sub = document.createElement('p'); sub.className = 'subtotal'; sub.innerHTML = '<span>Subtotal</span><span></span>'; sub.lastChild.textContent = money(subtotal);
    const note = document.createElement('p'); note.className = 'hint';
    note.textContent = subtotal >= FREE_SHIPPING_OVER ? 'You get free shipping.' : 'Add ' + money(FREE_SHIPPING_OVER - subtotal) + ' more for free shipping.';
    const go = document.createElement('a'); go.className = 'btn fill'; go.href = 'checkout.html'; go.textContent = 'Checkout';
    foot.append(sub, note, go);
  }
  const btn = el('bagbtn'); if (btn) btn.onclick = (e) => { e.preventDefault(); openBag(); };
  el('close').onclick = closeBag; el('scrim').onclick = closeBag;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBag(); });
  document.addEventListener('cart', render);
  render();
}
