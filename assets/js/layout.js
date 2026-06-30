/* Shared nav & footer — single source of truth */
(function () {
  'use strict';

  var PARTIALS = {
    nav: 'assets/partials/nav.html',
    footer: 'assets/partials/footer.html'
  };

  function currentPage() {
    var page = document.body.getAttribute('data-page');
    if (page) return page;
    var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    if (file === 'index' || file === '') return 'home';
    return file;
  }

  function setActiveNav() {
    var page = currentPage();
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      var active = link.getAttribute('data-nav') === page;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function inject(id, url) {
    var slot = document.getElementById(id);
    if (!slot) return Promise.resolve();
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('partial failed');
        return r.text();
      })
      .then(function (html) {
        slot.outerHTML = html;
      });
  }

  window.kcLayoutReady = Promise.all([
    inject('site-nav', PARTIALS.nav),
    inject('site-footer', PARTIALS.footer)
  ]).then(function () {
    setActiveNav();
  }).catch(function () {
    /* Partials fail when opening HTML from file:// — inline fallback stays empty */
  });
})();
