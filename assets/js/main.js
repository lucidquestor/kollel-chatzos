/* Kollel Chatzos — language, nav, scroll reveals, forms */
(function () {
  'use strict';

  var STORE = 'kc-lang';

  function applyLang(lang) {
    var yi = lang === 'yi';
    document.body.classList.toggle('lang-yi', yi);
    document.body.classList.toggle('lang-en', !yi);
    document.documentElement.classList.remove('pref-en', 'pref-yi');
    document.documentElement.classList.add(yi ? 'pref-yi' : 'pref-en');
    document.documentElement.setAttribute('lang', yi ? 'yi' : 'en');
    document.documentElement.setAttribute('dir', yi ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function setActiveNav() {
    var page = document.body.getAttribute('data-page');
    if (!page) {
      var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
      page = (file === 'index' || file === '') ? 'home' : file;
    }
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      var active = link.getAttribute('data-nav') === page;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.nav-links a:not([data-nav])').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var active = (page === 'home' && /index\.html?$/.test(href)) ||
        href.replace(/\.html$/, '') === page ||
        (page === 'home' && href === '/');
      link.classList.toggle('active', active);
    });
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
    setActiveNav();
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

  function isBelowFold(el) {
    var rect = el.getBoundingClientRect();
    return rect.top > window.innerHeight * 0.88;
  }

  function initReveal() {
    var pending = [];
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (isBelowFold(el)) {
        el.classList.add('reveal-pending');
        pending.push(el);
      } else {
        el.classList.add('in');
      }
    });

    if (!('IntersectionObserver' in window) || !pending.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    pending.forEach(function (el) { io.observe(el); });
  }

  function syncCustomSelect(wrap) {
    var native = wrap.querySelector('select');
    var valueEl = wrap.querySelector('.custom-select__value');
    var menu = wrap.querySelector('.custom-select__menu');
    if (!native || !valueEl || !menu) return;
    var idx = native.selectedIndex;
    valueEl.textContent = native.options[idx] ? native.options[idx].textContent : '';
    menu.querySelectorAll('.custom-select__option').forEach(function (el, i) {
      el.classList.toggle('is-selected', i === idx);
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  function closeCustomSelect(wrap) {
    if (!wrap) return;
    var trigger = wrap.querySelector('.custom-select__trigger');
    var menu = wrap.querySelector('.custom-select__menu');
    wrap.classList.remove('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) {
      menu.hidden = true;
      menu.querySelectorAll('.custom-select__option.is-focused').forEach(function (el) {
        el.classList.remove('is-focused');
      });
    }
  }

  function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(function (wrap) {
      var native = wrap.querySelector('select');
      var trigger = wrap.querySelector('.custom-select__trigger');
      var menu = wrap.querySelector('.custom-select__menu');
      if (!native || !trigger || !menu) return;

      menu.innerHTML = '';
      Array.from(native.options).forEach(function (opt, i) {
        var li = document.createElement('li');
        li.className = 'custom-select__option' + (opt.selected ? ' is-selected' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('data-index', String(i));
        li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
        li.textContent = opt.textContent;
        menu.appendChild(li);
      });

      function selectIndex(i) {
        if (i < 0 || i >= native.options.length) return;
        native.selectedIndex = i;
        syncCustomSelect(wrap);
        native.dispatchEvent(new Event('change', { bubbles: true }));
      }

      function openMenu() {
        document.querySelectorAll('.custom-select.is-open').forEach(function (other) {
          if (other !== wrap) closeCustomSelect(other);
        });
        wrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
      }

      trigger.addEventListener('click', function () {
        if (wrap.classList.contains('is-open')) closeCustomSelect(wrap);
        else openMenu();
      });

      trigger.addEventListener('keydown', function (e) {
        var idx = native.selectedIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!wrap.classList.contains('is-open')) openMenu();
          var next = e.key === 'ArrowDown'
            ? Math.min(idx + 1, native.options.length - 1)
            : Math.max(idx - 1, 0);
          selectIndex(next);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (wrap.classList.contains('is-open')) closeCustomSelect(wrap);
          else openMenu();
        } else if (e.key === 'Escape') {
          closeCustomSelect(wrap);
        }
      });

      menu.addEventListener('click', function (e) {
        var opt = e.target.closest('.custom-select__option');
        if (!opt) return;
        selectIndex(Number(opt.getAttribute('data-index')));
        closeCustomSelect(wrap);
        trigger.focus();
      });

      syncCustomSelect(wrap);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select.is-open').forEach(closeCustomSelect);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-select.is-open').forEach(closeCustomSelect);
      }
    });
  }

  function initPartnerForm() {
    var form = document.getElementById('partner-form-el');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('form-note');
      if (note) note.style.display = 'block';
      form.reset();
      document.querySelectorAll('.custom-select').forEach(syncCustomSelect);
    });
    form.addEventListener('reset', function () {
      setTimeout(function () {
        document.querySelectorAll('.custom-select').forEach(syncCustomSelect);
      }, 0);
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
    initCustomSelects();
    initPartnerForm();
    initMailingForm();
    initTaxIdCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
