// Meta Pixel — fbq() stub dərhal mövcuddur (digər fayllardan çağırışlar təhlükəsizdir,
// avtomatik növbəyə düşür), AMMA əsl fbevents.js kitabxanası (~300 KB) yalnız
// istifadəçi interaksiyasında / 4s sonra yüklənir. Bu, TBT-ni azaldır —
// böyük skript ilk yükləmə zamanı əsas thread-i bloklamır.
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

var pixelInited = false;
function initPixel() {
  if (pixelInited) return;
  pixelInited = true;
  var t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(t, s);
  fbq('init', '1660843438327381');
  fbq('track', 'PageView');
}

// İstifadəçinin ilk interaksiyasında (scroll, klik, klaviatura, toxunma) yüklə
['scroll', 'click', 'keydown', 'touchstart'].forEach(function(ev) {
  window.addEventListener(ev, initPixel, { once: true, passive: true });
});
// İnteraksiya olmasa: brauzer boş qaldığı an yüklə (requestIdleCallback, max 8s).
// ga-init.js ilə eyni məntiq.
if ('requestIdleCallback' in window) {
  requestIdleCallback(initPixel, { timeout: 8000 });
} else {
  setTimeout(initPixel, 4000);
}