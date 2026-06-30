const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'index.html', page: 'home' },
  { file: 'about.html', page: 'about' },
  { file: 'segulos.html', page: 'segulos' },
  { file: 'partner.html', page: 'partner' }
];

const headExtras = `
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Kollel Chatzos" />
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="assets/icons/favicon-16.png" />`;

const navRe = /<!-- NAV -->[\s\S]*?<\/header>\s*/;
const footRe = /<!-- FOOTER -->[\s\S]*?<\/footer>\s*/;

const replacements = [
  ['<body class="lang-en">', (p) => `<body class="lang-en" data-page="${p}">`],
  ['<div style="display:flex;align-items:center;gap:12px;">', '<div class="nav-actions">'],
  ['style="margin-bottom:40px;"', 'class="section-header"'],
  ['style="margin-bottom:34px;"', 'class="section-header"'],
  ['style="color:var(--muted);max-width:620px;margin:8px auto 0;"', 'class="section-lead"'],
  ['style="color:var(--muted);max-width:680px;margin:10px auto 0;"', 'class="section-lead section-lead--md"'],
  ['style="color:var(--muted);max-width:760px;margin:14px auto 0;font-size:1.08rem;"', 'class="section-lead section-lead--lg"'],
  ['style="color:var(--muted);max-width:600px;margin:8px auto 0;"', 'class="section-lead"'],
  ['style="color:var(--muted);max-width:640px;margin:8px auto 0;"', 'class="section-lead"'],
  ['style="color:var(--muted);max-width:560px;margin:10px auto 22px;"', 'class="section-lead section-lead--sm"'],
  ['style="color:var(--muted);margin:10px 0 24px;"', 'class="section-lead section-lead--contact"'],
  ['style="color:var(--muted);max-width:680px;margin:14px auto 18px;"', 'class="section-lead section-lead--md"'],
  ['style="margin-top:clamp(-72px,-6vw,-44px);padding-top:0;padding-bottom:0;position:relative;z-index:5;"', 'class="section-quickgive"'],
  ['style="padding-top:clamp(54px,6vw,72px);"', 'class="section-stats-gap"'],
  ['style="padding:54px 40px;"', 'class="panel-spacious"'],
  ['style="padding:46px 40px;"', 'class="panel-mail"'],
  ['style="padding:48px 40px;"', 'class="panel-simcha"'],
  ['style="margin-top:38px;"', 'class="stats-in-panel"'],
  ['style="margin-top:30px;"', 'class="cta-row"'],
  ['style="margin-top:8px;"', 'class="prose-actions"'],
  ['style="margin-top:26px;"', 'class="quote-spaced"'],
  ['style="font-size:2rem;"', 'class="section-title-md"'],
  ['style="font-size:2.2rem;"', 'class="section-title-lg"'],
  ['style="color:var(--text);font-size:1.05rem;"', 'class="testimonial-quote"'],
  ['style="margin-top:14px;"', 'class="testimonial-by gold"'],
  ['style="margin-top:28px;"', 'class="amount-section center"'],
  ['style="color:var(--ink-soft);margin-bottom:14px;"', 'class="amount-row-intro"'],
  ['style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"', 'class="amount-row"'],
  ['style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center;margin-bottom:30px;"', 'class="partner-logos"'],
  ['style="display:flex;align-items:center;justify-content:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px 40px;box-shadow:var(--shadow);min-width:236px;min-height:88px;"', 'class="logo-card reveal"'],
  ['style="height:30px;width:auto;display:block;"', ''],
  ['style="height:40px;width:auto;display:block;"', ''],
  ['style="max-width:580px;margin:0 auto;background:var(--navy);color:#fff;border-radius:18px;padding:30px 32px;text-align:center;box-shadow:var(--shadow-lg);"', 'class="tax-id-card reveal"'],
  ['style="color:var(--gold-200);font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px;"', 'class="tax-label"'],
  ['style="font-size:2.3rem;font-weight:800;letter-spacing:.1em;color:#fff;font-family:\'Inter\',sans-serif;"', 'class="tax-number" dir="ltr"'],
  ['style="color:rgba(255,255,255,.72);font-size:.97rem;margin-top:12px;max-width:440px;margin-left:auto;margin-right:auto;"', 'class="tax-note"'],
  ['style="margin-top:18px;cursor:pointer;border:none;" onclick="if(navigator.clipboard){navigator.clipboard.writeText(\'881313826\');var d=this.querySelector(\'.copy-label\'),e=this.querySelector(\'.copy-done\');if(d&&e){d.style.display=\'none\';e.style.display=\'inline\';var t=this;setTimeout(function(){d.style.display=\'inline\';e.style.display=\'none\';},2000);}}"', 'id="copy-tax-id" type="button"'],
  ['style="display:none;"', 'class="copy-done"'],
  ['style="font-family:\'Frank Ruhl Libre\',serif;font-size:1.15rem;"', 'class="simcha-tags gold"'],
  ['style="width:100%;justify-content:center;"', 'class="btn-block"'],
  ['style="display:none;color:var(--gold-200);margin-top:14px;text-align:center;"', 'class="form-note" id="form-note"'],
  ['style="color:var(--muted);margin-top:22px;font-size:.92rem;"', 'class="section-source"'],
  ['onsubmit="this.querySelector(\'.ml-note\').style.display=\'block\';this.reset();return false;" style="max-width:480px;margin:0 auto;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"', 'class="mailing-form"'],
  ['class="field" style="flex:1;min-width:220px;margin:0;"', 'class="field-input"'],
  ['class="ml-note" style="display:none;width:100%;color:var(--gold-200);margin-top:8px;"', 'class="ml-note"'],
  ['<script src="assets/js/main.js" defer></script>', '<script src="assets/js/layout.js"></script>\n  <script src="assets/js/main.js" defer></script>']
];

for (const { file, page } of pages) {
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace('<link rel="apple-touch-icon" href="assets/icons/favicon.svg" />',
    `<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png" />${headExtras}`);

  html = html.replace(navRe, '<div id="site-nav"></div>\n\n  <main id="main">\n');
  html = html.replace(footRe, '  </main>\n\n  <div id="site-footer"></div>\n\n');

  html = html.replace('<body class="lang-en">', `<body class="lang-en" data-page="${page}">`);
  html = html.replace('<body class="lang-en" data-page="' + page + '">',
    `<body class="lang-en" data-page="${page}">\n  <a class="skip-link" href="#main"><span class="en">Skip to content</span><span class="yi">גייט צום אינhalt</span></a>`);

  for (const [from, to] of replacements) {
    if (typeof to === 'function') html = html.replace(from, to(page));
    else html = html.replaceAll(from, to);
  }

  // logo card variants
  html = html.replace(/class="logo-card reveal">\s*\n\s*<img src="assets\/images\/matbia-logo.svg"/g,
    'class="logo-card logo-card--matbia reveal">\n        <img src="assets/images/matbia-logo.svg"');
  html = html.replace(/class="logo-card reveal">\s*\n\s*<img src="assets\/images\/pledger-logo.svg"/g,
    'class="logo-card logo-card--pledger reveal">\n        <img src="assets/images/pledger-logo.svg"');

  fs.writeFileSync(file, html, 'utf8');
  console.log('Updated', file);
}

console.log('Done');
