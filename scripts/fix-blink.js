const fs = require('fs');

const nav = fs.readFileSync('assets/partials/nav.html', 'utf8').trim();
const footer = fs.readFileSync('assets/partials/footer.html', 'utf8').trim();
const langInit = '  <script src="assets/js/lang-init.js"></script>';

const pages = ['index.html', 'about.html', 'segulos.html', 'partner.html'];

const navBlock = nav + '\n\n  <main id="main">';
const footerBlock = '  </main>\n\n  ' + footer;

for (const file of pages) {
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('lang-init.js')) {
    html = html.replace('<link rel="stylesheet" href="assets/css/main.css" />',
      langInit + '\n  <link rel="stylesheet" href="assets/css/main.css" />');
  }

  html = html.replace(/\s*<div id="site-nav"><\/div>\s*\n\s*<main id="main">/g, '\n\n  ' + navBlock);
  html = html.replace(/\s*<\/main>\s*\n\s*<div id="site-footer"><\/div>/g, '\n' + footerBlock);

  // Replace old inline nav (before main or first section) with standard nav
  html = html.replace(/<header class="nav">[\s\S]*?<\/header>\s*(?=(?:<!--|<main|<section))/,
    nav + '\n\n  <main id="main">\n');

  // Ensure single main wrapper — remove duplicate main tags if any
  html = html.replace(/<main id="main">\s*<main id="main">/g, '<main id="main">');

  // Replace footer before scripts
  html = html.replace(/<footer class="foot">[\s\S]*?<\/footer>\s*(?=<script)/, footer + '\n\n  ');

  // Remove duplicate closing main
  html = html.replace(/<\/main>\s*<\/main>/g, '</main>');

  // Remove layout.js
  html = html.replace(/\s*<script src="assets\/js\/layout\.js"><\/script>/g, '');

  // Ensure main closes before footer
  if (!html.includes('</main>')) {
    html = html.replace(/(\n  <footer class="foot">)/, '\n  </main>$1');
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('Fixed', file);
}
