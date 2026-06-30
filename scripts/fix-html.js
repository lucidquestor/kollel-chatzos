const fs = require('fs');

function mergeDuplicateAttrs(html) {
  // Merge duplicate class attributes on the same tag
  html = html.replace(/class="([^"]*)"\s+class="([^"]*)"/g, (_, a, b) => {
    const merged = [...new Set((a + ' ' + b).split(/\s+/).filter(Boolean))].join(' ');
    return `class="${merged}"`;
  });
  // Repeat until no more duplicates (handles triple+)
  while (/class="[^"]*"\s+class="/.test(html)) {
    html = html.replace(/class="([^"]*)"\s+class="([^"]*)"/g, (_, a, b) => {
      const merged = [...new Set((a + ' ' + b).split(/\s+/).filter(Boolean))].join(' ');
      return `class="${merged}"`;
    });
  }
  html = html.replace(/\s+dir="ltr"\s+class="tax-number"\s+dir="ltr"/g, ' class="tax-number" dir="ltr"');
  html = html.replace(/type="button"\s+class="btn btn-gold"\s+id="copy-tax-id"\s+type="button"/g,
    'type="button" class="btn btn-gold" id="copy-tax-id"');
  html = html.replace(/גייט צום אינhalt/g, 'גייט צום אינהאלט');
  return html;
}

for (const file of ['index.html', 'about.html', 'segulos.html', 'partner.html']) {
  let html = fs.readFileSync(file, 'utf8');
  html = mergeDuplicateAttrs(html);
  fs.writeFileSync(file, html, 'utf8');
  console.log('Fixed', file);
}
