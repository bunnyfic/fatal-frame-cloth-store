const GA_ID = 'G-40DX618193';
indow.track = function () {}; // does nothing until GA is configured
(function () {
  const local = /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  if (local || !/^G-[A-Z0-9]{6,}$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return; // skip dev traffic
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);
  window.track = (name, params) => gtag('event', name, params);
})();
 
// Helper for shop events. price is in cents.
function gaItem(p, qty = 1, size) {
  return { item_id: String(p.id), item_name: p.name, item_variant: size, price: p.price / 100, quantity: qty };
}
