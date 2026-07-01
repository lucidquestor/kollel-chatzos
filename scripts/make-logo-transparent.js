/**
 * Strip near-white pixels from a PNG (RGBA output). No dependencies.
 * Usage: node scripts/make-logo-transparent.js <input.png> <output.png>
 */
const { readPng, writePng, makeTransparent } = require('./png-utils');

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error('Usage: node make-logo-transparent.js <input.png> <output.png>');
  process.exit(1);
}

const { width, height, pixels } = readPng(input);
makeTransparent(pixels);
writePng(output, width, height, pixels);
console.log(`Wrote ${output} (${width}x${height})`);
