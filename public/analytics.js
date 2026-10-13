// Google Analytics 4. Paste your Measurement ID below (looks like G-ABC123XYZ9).
const GA_ID = 'G-40DX618193';

window.track = function () {}; // does nothing until GA is configured
window.sendPageView = function () {};
(function () {
  const local = /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  if (local || !/^G-[A-Z0-9]{6,}$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return; // skip dev traffic
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  // A page can set window.GA_DEFER_PAGEVIEW = true and call sendPageView() once its title is final.
  gtag('config', GA_ID, window.GA_DEFER_PAGEVIEW ? { send_page_view: false } : {});
  window.sendPageView = () => { try { gtag('event', 'page_view', { page_title: document.title, page_location: location.href }); } catch (e) {} };
  window.track = (name, params) => { try { gtag('event', name, params); } catch (e) {} };
})();

// Helper for shop events. price is in cents.
function gaItem(p, qty = 1, size) {
  if (!p) return {};
  return { item_id: String(p.id), item_name: p.name, item_category: 'Dresses', item_variant: size, price: p.price / 100, quantity: qty };
}
