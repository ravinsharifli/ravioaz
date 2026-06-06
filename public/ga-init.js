window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-4YEWCWGVTD', {
  page_title: 'Ravio',
  send_page_view: true,
});
window.trackEvent = function (eventName, params) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params || {});
  }
};
