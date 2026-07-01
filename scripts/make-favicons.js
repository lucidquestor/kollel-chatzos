/**
 * Generate favicon PNGs + SVG from assets/images/logo.png
 * Favicons use a white background for clarity at small sizes.
 * Usage: node scripts/make-favicons.js
 */
const fs = require('fs');
const path = require('path');
const { readPng, writePng } = require('./png-utils');

const ROOT = path.join(__dirname, '..');
const LOGO = path.join(ROOT, 'assets/images/logo.png');
const ICONS = path.join(ROOT, 'assets/icons');

function cropToContent(width, height, pixels) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = pixels[(y * width + x) * 4 + 3];
      if (a > 12) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < minX) return { width, height, pixels };
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const cropped = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((minY + y) * width + (minX + x)) * 4;
      const di = (y * cw + x) * 4;
      cropped[di] = pixels[si];
      cropped[di + 1] = pixels[si + 1];
      cropped[di + 2] = pixels[si + 2];
      cropped[di + 3] = pixels[si + 3];
    }
  }
  return { width: cw, height: ch, pixels: cropped };
}

function resizeRgba(srcW, srcH, src, dstW, dstH) {
  const out = Buffer.alloc(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const gx = ((x + 0.5) * srcW) / dstW - 0.5;
      const gy = ((y + 0.5) * srcH) / dstH - 0.5;
      const x0 = Math.max(0, Math.floor(gx));
      const y0 = Math.max(0, Math.floor(gy));
      const x1 = Math.min(srcW - 1, x0 + 1);
      const y1 = Math.min(srcH - 1, y0 + 1);
      const tx = gx - x0;
      const ty = gy - y0;
      const di = (y * dstW + x) * 4;
      for (let c = 0; c < 4; c++) {
        const v00 = src[(y0 * srcW + x0) * 4 + c];
        const v10 = src[(y0 * srcW + x1) * 4 + c];
        const v01 = src[(y1 * srcW + x0) * 4 + c];
        const v11 = src[(y1 * srcW + x1) * 4 + c];
        const v0 = v00 + (v10 - v00) * tx;
        const v1 = v01 + (v11 - v01) * tx;
        out[di + c] = Math.round(v0 + (v1 - v0) * ty);
      }
    }
  }
  return out;
}

function flattenOnWhite(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3] / 255;
    pixels[i] = Math.round(pixels[i] * a + 255 * (1 - a));
    pixels[i + 1] = Math.round(pixels[i + 1] * a + 255 * (1 - a));
    pixels[i + 2] = Math.round(pixels[i + 2] * a + 255 * (1 - a));
    pixels[i + 3] = 255;
  }
}

function fitSquare(width, height, pixels, size, padRatio = 0.1) {
  const side = Math.max(width, height);
  const pad = Math.round(side * padRatio);
  const canvas = side + pad * 2;
  const square = Buffer.alloc(canvas * canvas * 4, 255);
  const ox = Math.round((canvas - width) / 2);
  const oy = Math.round((canvas - height) / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const a = pixels[si + 3] / 255;
      if (a <= 0) continue;
      const di = ((oy + y) * canvas + (ox + x)) * 4;
      const r = pixels[si];
      const g = pixels[si + 1];
      const b = pixels[si + 2];
      square[di] = Math.round(r * a + 255 * (1 - a));
      square[di + 1] = Math.round(g * a + 255 * (1 - a));
      square[di + 2] = Math.round(b * a + 255 * (1 - a));
      square[di + 3] = 255;
    }
  }
  const scaled = resizeRgba(canvas, canvas, square, size, size);
  flattenOnWhite(scaled);
  return { width: size, height: size, pixels: scaled };
}

function makeSvgFromPng(pngPath, size) {
  const b64 = fs.readFileSync(pngPath).toString('base64');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <image href="data:image/png;base64,${b64}" width="${size}" height="${size}"/>
</svg>`;
}

function main() {
  const src = readPng(LOGO);
  const cropped = cropToContent(src.width, src.height, src.pixels);

  fs.mkdirSync(ICONS, { recursive: true });

  const sizes = [
    ['favicon-16.png', 16],
    ['favicon-32.png', 32],
    ['apple-touch-icon.png', 180],
  ];

  for (const [name, size] of sizes) {
    const out = fitSquare(cropped.width, cropped.height, cropped.pixels, size);
    const file = path.join(ICONS, name);
    writePng(file, out.width, out.height, out.pixels);
    console.log('Wrote', file);
  }

  const svg32 = path.join(ICONS, 'favicon-32.png');
  fs.writeFileSync(path.join(ICONS, 'favicon.svg'), makeSvgFromPng(svg32, 32));
  console.log('Wrote favicon.svg');
}

main();
