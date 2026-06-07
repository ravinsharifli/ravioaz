// GA — LCP-dən sonra başla, TBT-yə mane olmasın
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// İlk istifadəçi interaksiyasından sonra və ya 4s timeout
function initGA() {
  gtag('js', new Date());
  gtag('config', 'G-4YEWCWGVTD', {
    page_title: 'Ravio',
    send_page_view: true,
    transport_type: 'beacon',  // page unload-da itirilməsin
  });
}

var gaInited = false;
function maybeInitGA() {
  if (!gaInited) { gaInited = true; initGA(); }
}

// İstifadəçi hər hansı interaksiya edən kimi yüklə
['scroll', 'click', 'keydown', 'touchstart'].forEach(function(e) {
  window.addEventListener(e, maybeInitGA, { once: true, passive: true });
});
// Maksimum 4 saniyə gözlə
setTimeout(maybeInitGA, 4000);

window.trackEvent = function(eventName, params) {
  maybeInitGA();
  gtag('event', eventName, params || {});
};
