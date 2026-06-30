/* Apply saved language before first paint — prevents EN/Yiddish flash */
(function () {
  var lang = 'en';
  try { lang = localStorage.getItem('kc-lang') || 'en'; } catch (e) {}
  var yi = lang === 'yi';
  var root = document.documentElement;
  root.classList.add(yi ? 'pref-yi' : 'pref-en');
  root.setAttribute('lang', yi ? 'yi' : 'en');
  root.setAttribute('dir', yi ? 'rtl' : 'ltr');
})();
