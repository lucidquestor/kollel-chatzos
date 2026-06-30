/* Kollel Chatzos — language, nav, scroll reveals, forms */
(function () {
  'use strict';

  var STORE = 'kc-lang';

  function applyLang(lang) {
    var yi = lang === 'yi';
    document.body.classList.toggle('lang-yi', yi);
    document.body.classList.toggle('lang-en', !yi);
    document.documentElement.setAttribute('lang', yi ? 'yi' : 'en');
    document.documentElement.setAttribute('dir', yi ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function initLang() {
    var saved = 'en';
    try { saved = localStorage.getItem(STORE) || 'en'; } catch (e) {}
    applyLang(saved);
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });
  }

  function initNav() {
    var nav = document.querySelector('header.nav');
    var toggle = document.querySelector('.nav-toggle');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  function initPartnerForm() {
    var form = document.getElementById('partner-form-el');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('form-note');
      if (note) note.style.display = 'block';
      form.reset();
    });
  }

  function initMailingForm() {
    document.querySelectorAll('.mailing-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = form.querySelector('.ml-note');
        if (note) note.style.display = 'block';
        form.reset();
      });
    });
  }

  function initTaxIdCopy() {
    var btn = document.getElementById('copy-tax-id');
    if (!btn || !navigator.clipboard) return;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText('881313826').then(function () {
        var label = btn.querySelector('.copy-label');
        var done = btn.querySelector('.copy-done');
        if (!label || !done) return;
        label.style.display = 'none';
        done.style.display = 'inline';
        setTimeout(function () {
          label.style.display = 'inline';
          done.style.display = 'none';
        }, 2000);
      });
    });
  }

  function boot() {
    initLang();
    initNav();
    initReveal();
    initPartnerForm();
    initMailingForm();
    initTaxIdCopy();
  }

  var ready = window.kcLayoutReady || Promise.resolve();
  ready.then(boot);
})();
