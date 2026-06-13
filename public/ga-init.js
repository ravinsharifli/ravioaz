// GA — LCP bitdikdən sonra başlayır, network bandwidth-i blok etmir
// gtag/js skripti indi buradan yüklənir — index.html-dən silinib
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

function loadGAScript() {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-4YEWCWGVTD';
  document.head.appendChild(s);
  s.onload = function() {
    gtag('js', new Date());
    gtag('config', 'G-4YEWCWGVTD', {
      page_title: 'Ravio',
      send_page_view: true,
      transport_type: 'beacon',
    });
  };
}

var gaInited = false;
function maybeInitGA() {
  if (!gaInited) { gaInited = true; loadGAScript(); }
}

// İstifadəçi ilk interaksiyasında (scroll, klik, klaviatura, toxunma) yüklə
['scroll', 'click', 'keydown', 'touchstart'].forEach(function(ev) {
  window.addEventListener(ev, maybeInitGA, { once: true, passive: true });
});
// Heç interaksiya olmasa, 4 saniyə sonra yüklə
setTimeout(maybeInitGA, 4000);

// Digər komponentlər hadisə göndərə bilər
window.trackEvent = function(eventName, params) {
  maybeInitGA();
  gtag('event', eventName, params || {});
};