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
    var opt = native.options[idx];
    valueEl.textContent = opt ? opt.textContent : '';
    valueEl.classList.toggle('is-placeholder', !opt || !opt.value);
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

  function initCustomSelects(root) {
    var scope = root || document;
    scope.querySelectorAll('.custom-select').forEach(function (wrap) {
      if (wrap.dataset.selectReady === 'true') return;
      wrap.dataset.selectReady = 'true';

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

  function formDataToObject(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });
    return data;
  }

  function setFormFeedback(form, successEl, errorEl, state) {
    if (successEl) successEl.classList.toggle('is-visible', state === 'success');
    if (errorEl) errorEl.classList.toggle('is-visible', state === 'error');
  }

  function setSubmitLoading(form, loading) {
    var btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    btn.classList.toggle('is-loading', loading);
    btn.disabled = loading;
  }

  function submitToApi(form, endpoint, onSuccess) {
    var successEl = form.querySelector('.form-feedback--success, .ml-note');
    var errorEl = form.querySelector('.form-feedback--error, .ml-error');

    setFormFeedback(form, successEl, errorEl, null);
    setSubmitLoading(form, true);

    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign(formDataToObject(form), {
        lang: document.documentElement.getAttribute('lang') || 'en',
      })),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || !body.ok) {
            throw new Error(body.error || 'Request failed');
          }
          return body;
        });
      })
      .then(function () {
        form.reset();
        if (onSuccess) onSuccess();
        setFormFeedback(form, successEl, errorEl, 'success');
      })
      .catch(function () {
        setFormFeedback(form, successEl, errorEl, 'error');
      })
      .finally(function () {
        setSubmitLoading(form, false);
      });
  }

  function initPartnerForm() {
    var form = document.getElementById('partner-form-el');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitToApi(form, '/api/partner', function () {
        document.querySelectorAll('.custom-select').forEach(syncCustomSelect);
      });
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
        submitToApi(form, '/api/mailing');
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

  var DONATE_BASE = 'https://www.firstaccept.net/HANETZACH';

  function donateUrl(amount) {
    if (!amount) return DONATE_BASE;
    return DONATE_BASE + '?amount=' + encodeURIComponent(String(amount));
  }

  function formatZmanTime(iso) {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function initZmanimClock() {
    var root = document.getElementById('zmanim-clock');
    if (!root) return;

    fetch('/api/zmanim')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error('zmanim failed');
        var chatzotEl = root.querySelector('[data-zman="chatzot"]');
        var alosEl = root.querySelector('[data-zman="alos"]');
        if (chatzotEl) chatzotEl.textContent = formatZmanTime(data.chatzot);
        if (alosEl) alosEl.textContent = formatZmanTime(data.alos);
        root.hidden = false;
        root.classList.add('is-ready');
      })
      .catch(function () {
        root.remove();
      });
  }

  function initDedicationModal() {
    var triggers = document.querySelectorAll('.js-donate');
    if (!triggers.length) return;

    var modal = document.createElement('div');
    modal.className = 'dedication-modal';
    modal.id = 'dedication-modal';
    modal.hidden = true;
    modal.innerHTML = [
      '<div class="dedication-modal__backdrop" data-close></div>',
      '<div class="dedication-modal__panel" role="dialog" aria-modal="true" aria-labelledby="dedication-modal-title">',
      '  <div class="dedication-modal__header">',
      '    <button type="button" class="dedication-modal__close" data-close aria-label="Close"><span aria-hidden="true">&times;</span></button>',
      '    <p class="eyebrow"><span class="en">Dedicate tonight</span><span class="yi">ווידמעט די נאכט</span></p>',
      '    <h2 id="dedication-modal-title" class="dedication-modal__title">',
      '      <span class="en">Name for tefillah at chatzos</span>',
      '      <span class="yi">נאמען פאר תפילה ביי חצות</span>',
      '    </h2>',
      '    <p class="dedication-modal__lead">',
      '      <span class="en">The lomdim will have you in mind tonight. Then continue to complete your donation.</span>',
      '      <span class="yi">די לומדים וועלן אייך דערמאנען היינט ביי חצות. דערנאך גייט ווייטער צום באצalen.</span>',
      '    </p>',
      '  </div>',
      '  <div class="dedication-modal__body">',
      '  <form id="dedication-form" class="dedication-form">',
      '    <input type="hidden" name="amount" id="dedication-amount" />',
      '    <input type="hidden" name="source" value="donate_modal" />',
      '    <div class="field-row">',
      '      <div class="field">',
      '        <label><span class="en">Full name</span><span class="yi">פולע נאמען</span></label>',
      '        <input type="text" name="name" required autocomplete="name" />',
      '      </div>',
      '      <div class="field">',
      '        <label><span class="en">Hebrew name</span><span class="yi">נאמען לתפילה</span></label>',
      '        <input type="text" name="hebrew_name" autocomplete="off" />',
      '      </div>',
      '    </div>',
      '    <div class="field">',
      '      <label id="dedication-occasion-label"><span class="en">Occasion</span><span class="yi">סיבה / זכות</span></label>',
      '      <div class="custom-select">',
      '        <select name="occasion" class="custom-select__native" tabindex="-1" aria-hidden="true">',
      '          <option value="">Choose…</option>',
      '          <option>Refuah</option>',
      '          <option>Parnassah</option>',
      '          <option>Shidduch</option>',
      '          <option>Simcha</option>',
      '          <option>L\'zecher nishmas</option>',
      '          <option>General zechus</option>',
      '        </select>',
      '        <button type="button" class="custom-select__trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="dedication-occasion-label">',
      '          <span class="custom-select__value"></span>',
      '          <span class="custom-select__chev" aria-hidden="true"></span>',
      '        </button>',
      '        <ul class="custom-select__menu" role="listbox" hidden></ul>',
      '      </div>',
      '    </div>',
      '    <div class="field">',
      '      <label><span class="en">Note (optional)</span><span class="yi">נאטיץ (אפציונעל)</span></label>',
      '      <textarea name="note" rows="2"></textarea>',
      '    </div>',
      '    <div class="field-honeypot" aria-hidden="true">',
      '      <label>Leave blank</label>',
      '      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />',
      '    </div>',
      '    <p class="dedication-modal__amount"><span class="en">Donation</span><span class="yi">נדבה</span>: <strong id="dedication-amount-label"></strong></p>',
      '    <div class="dedication-modal__actions">',
      '      <button type="submit" class="btn btn-gold btn-block">',
      '        <span class="en">Save &amp; continue to donate ✦</span>',
      '        <span class="yi">אפגעשפארט &amp; ווייטער צום באצalen ✦</span>',
      '      </button>',
      '      <button type="button" class="btn btn-ghost btn-block dedication-modal__skip" data-skip>',
      '        <span class="en">Skip — donate without note</span>',
      '        <span class="yi">איבerspringen — נאר באצalen</span>',
      '      </button>',
      '    </div>',
      '    <p class="form-feedback form-feedback--error dedication-modal__error">',
      '      <span class="en">Could not save. You can still donate — or try again.</span>',
      '      <span class="yi">עס איז נישט געשפארט. איר קענט נאכאלץ באצalen.</span>',
      '    </p>',
      '  </form>',
      '  </div>',
      '</div>',
    ].join('\n');
    document.body.appendChild(modal);
    initCustomSelects(modal);

    var form = modal.querySelector('#dedication-form');
    var amountInput = modal.querySelector('#dedication-amount');
    var amountLabel = modal.querySelector('#dedication-amount-label');
    var errorEl = modal.querySelector('.dedication-modal__error');
    var pendingAmount = null;
    var pendingUrl = DONATE_BASE;

    function openModal(amount) {
      pendingAmount = amount || null;
      pendingUrl = donateUrl(amount);
      amountInput.value = amount ? String(amount) : '';
      amountLabel.textContent = amount ? ('$' + amount) : '';
      var amountRow = modal.querySelector('.dedication-modal__amount');
      if (amountRow) amountRow.hidden = !amount;
      errorEl.classList.remove('is-visible');
      closeCustomSelect(modal.querySelector('.custom-select.is-open'));
      modal.hidden = false;
      document.body.classList.add('modal-open');
      var nameInput = form.querySelector('[name="name"]');
      if (nameInput) nameInput.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      closeCustomSelect(modal.querySelector('.custom-select'));
      form.reset();
      modal.querySelectorAll('.custom-select').forEach(syncCustomSelect);
      errorEl.classList.remove('is-visible');
    }

    function goDonate() {
      window.location.href = pendingUrl;
    }

    triggers.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var amount = link.getAttribute('data-donate-amount');
        openModal(amount ? Number(amount) : null);
      });
    });

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    modal.querySelector('[data-skip]').addEventListener('click', goDonate);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.classList.remove('is-visible');
      setSubmitLoading(form, true);

      fetch('/api/dedication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign(formDataToObject(form), {
          lang: document.documentElement.getAttribute('lang') || 'en',
        })),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || !body.ok) throw new Error('save failed');
          });
        })
        .then(goDonate)
        .catch(function () {
          errorEl.classList.add('is-visible');
        })
        .finally(function () {
          setSubmitLoading(form, false);
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
    initZmanimClock();
    initDedicationModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
