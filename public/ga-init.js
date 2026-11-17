// GA — LCP bitdikdən sonra başlayır, network bandwidth-i blok etmir
// gtag/js skripti indi buradan yüklənir — index.html-dən silinib
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
// App.tsx bu bayraqdan istifadə edir: GA hələ başlamayıbsa SPA page_view göndərilmir
// (ilk page_view config-in send_page_view-u ilə gedəcək) → ikiqat sayma olmur.
window.__gaInited = false;

var gaInited = false;
function loadGAScript() {
  if (gaInited) return;
  gaInited = true;
  window.__gaInited = true;

  // VACİB SIRA: js/config əmrləri dataLayer-ə DƏRHAL (sinxron) yazılır —
  // skriptin yüklənməsini gözləmir. Çünki gtag.js yükləndikdə dataLayer-i
  // əvvəldən oxuyur; əgər 'event' əmri 'config'-dən ƏVVƏL gəlsə,
  // hadisənin hara göndəriləcəyi bilinmir və o, sayılmadan itir.
  // (Əvvəlki versiyada bu, script.onload içində idi — buna görə hər
  // səhifədə ilk hadisə, məsələn view_item, GA4-ə HEÇ vaxt çatmırdı.)
  gtag('js', new Date());
  gtag('config', 'G-VKNTQ97S5P', {
    page_title: 'Ravio',
    send_page_view: true,
    transport_type: 'beacon',
  });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-VKNTQ97S5P';
  document.head.appendChild(s);
}

// İstifadəçi ilk interaksiyasında (scroll, klik, klaviatura, toxunma) yüklə
['scroll', 'click', 'keydown', 'touchstart'].forEach(function(ev) {
  window.addEventListener(ev, loadGAScript, { once: true, passive: true });
});
// İnteraksiya olmasa: brauzer boş qaldığı an yüklə (requestIdleCallback).
// Real istifadəçidə adətən 1 saniyədən az müddətdə işə düşür, çünki brauzer
// tez boşalır; maksimum 8 saniyə gözlənilir (timeout) — "əbədi" gözləmə olmur.
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadGAScript, { timeout: 12000 });
} else {
  setTimeout(loadGAScript, 10000);
}

// Digər komponentlər hadisə göndərə bilər
window.trackEvent = function(eventName, params) {
  loadGAScript();
  gtag('event', eventName, params || {});
};