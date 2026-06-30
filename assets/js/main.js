/* Kollel Chatzos — language toggle, nav, reveal-on-scroll */
(function () {
  'use strict';

  /* ---------- language ---------- */
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

  var saved = 'en';
  try { saved = localStorage.getItem(STORE) || 'en'; } catch (e) {}

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(saved);
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });

    /* ---------- mobile nav ---------- */
    var nav = document.querySelector('header.nav');
    var toggle = document.querySelector('.nav-toggle');
    if (toggle && nav) {
      toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
      nav.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); });
      });
    }

    /* ---------- reveal on scroll ---------- */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    /* ---------- contact form (demo) ---------- */
    var form = document.getElementById('partner-form-el');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = document.getElementById('form-note');
        if (note) note.style.display = 'block';
        form.reset();
      });
    }
  });
})();