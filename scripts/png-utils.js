/**
 * Minimal PNG read/write (RGBA). No dependencies.
 */
const fs = require('fs');
const zlib = require('zlib');

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilter(filter, row, prev, bpp) {
  const out = Buffer.from(row);
  const len = row.length;
  if (filter === 0) return out;
  for (let i = 0; i < len; i++) {
    const x = out[i];
    const a = i >= bpp ? out[i - bpp] : 0;
    const b = prev ? prev[i] : 0;
    const c = prev && i >= bpp ? prev[i - bpp] : 0;
    if (filter === 1) out[i] = (x + a) & 255;
    else if (filter === 2) out[i] = (x + b) & 255;
    else if (filter === 3) out[i] = (x + ((a + b) >> 1)) & 255;
    else if (filter === 4) out[i] = (x + paeth(a, b, c)) & 255;
  }
  return out;
}

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  const sig = buf.slice(0, 8);
  if (!sig.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error('Not a PNG');
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idats = [];

  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString('ascii');
    const data = buf.slice(offset + 8, offset + 8 + len);
    offset += 12 + len;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (![2, 6].includes(colorType)) {
    throw new Error(`Unsupported color type ${colorType}`);
  }

  const raw = zlib.inflateSync(Buffer.concat(idats));
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  let rawOff = 0;
  let prev = null;

  for (let y = 0; y < height; y++) {
    const filter = raw[rawOff++];
    const row = raw.slice(rawOff, rawOff + stride);
    rawOff += stride;
    const recon = unfilter(filter, row, prev, bpp);
    prev = recon;
    for (let x = 0; x < width; x++) {
      const di = (y * width + x) * 4;
      if (bpp === 4) {
        pixels[di] = recon[x * 4];
        pixels[di + 1] = recon[x * 4 + 1];
        pixels[di + 2] = recon[x * 4 + 2];
        pixels[di + 3] = recon[x * 4 + 3];
      } else {
        pixels[di] = recon[x * 3];
        pixels[di + 1] = recon[x * 3 + 1];
        pixels[di + 2] = recon[x * 3 + 2];
        pixels[di + 3] = 255;
      }
    }
  }

  return { width, height, pixels };
}

function filterRow(method, row, prev, bpp) {
  const out = Buffer.alloc(row.length);
  for (let i = 0; i < row.length; i++) {
    const raw = row[i];
    const a = i >= bpp ? row[i - bpp] : 0;
    const b = prev ? prev[i] : 0;
    const c = prev && i >= bpp ? prev[i - bpp] : 0;
    if (method === 0) out[i] = raw;
    else if (method === 1) out[i] = (raw - a) & 255;
    else if (method === 2) out[i] = (raw - b) & 255;
    else if (method === 3) out[i] = (raw - ((a + b) >> 1)) & 255;
    else out[i] = (raw - paeth(a, b, c)) & 255;
  }
  return out;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(filePath, width, height, pixels) {
  const stride = width * 4;
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(stride);
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = x * 4;
      row[di] = pixels[si];
      row[di + 1] = pixels[si + 1];
      row[di + 2] = pixels[si + 2];
      row[di + 3] = pixels[si + 3];
    }
    const filtered = filterRow(0, row, null, 4);
    rows.push(Buffer.concat([Buffer.from([0]), filtered]));
  }
  const compressed = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const out = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(require('path').dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, out);
}

function makeTransparent(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (r >= 230 && g >= 230 && b >= 230 && spread <= 30) {
      pixels[i + 3] = 0;
    } else if (r >= 210 && g >= 210 && b >= 210 && spread <= 36) {
      const fade = Math.max(0, Math.min(255, (255 - Math.min(r, g, b)) * 10));
      pixels[i + 3] = Math.min(pixels[i + 3], fade);
    }
  }
}

module.exports = { readPng, writePng, makeTransparent };
