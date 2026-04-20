// Re-optimize Zutaten · aggressiver (quality 40, max 400px statt 600px)
// Die Cards rendern @ ~150px display, 2× retina = 300, 400 ist reichlich
// Ziel: AVIF ~15-25KB (statt 60-90KB)

import sharp from 'sharp';
import { readdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'zutaten');

async function atomicConvert(buffer, finalPath, formatFn) {
  const tmp = finalPath + '.tmp';
  await formatFn(sharp(buffer)).toFile(tmp);
  try { await unlink(finalPath); } catch {}
  await rename(tmp, finalPath);
}

// Only the 17 toppings from the preload list (main.js ZUTATEN_IMAGES)
const TOPPINGS = [
  'champignons','zwiebeln','zucchetti','spinat','aubergine','peperoni',
  'artischocken','oliven','kapern','knoblauch','schinken','salami','speck',
  'thunfisch','sardellen','rahm','gorgonzola',
];

const allFiles = (await readdir(SRC)).filter(f => f.endsWith('.png'));
const files = allFiles.filter(f => TOPPINGS.includes(f.replace(/\.png$/, '')));
console.log(`Re-optimizing ${files.length} Zutaten-PNGs → AVIF q=40, WebP q=70, 400px max`);

for (const f of files) {
  const srcPath = path.join(SRC, f);
  const base = f.replace(/\.png$/, '');
  const buffer = await sharp(srcPath).toBuffer();

  const resized = await sharp(buffer).resize({
    width: 400,
    height: 400,
    fit: 'inside',
    withoutEnlargement: true,
  }).toBuffer();

  await atomicConvert(resized, path.join(SRC, `${base}.avif`),
    (s) => s.avif({ quality: 40, effort: 9 }));

  await atomicConvert(resized, path.join(SRC, `${base}.webp`),
    (s) => s.webp({ quality: 70, effort: 6 }));

  await atomicConvert(resized, path.join(SRC, `${base}.png`),
    (s) => s.png({ compressionLevel: 9, palette: true, quality: 75 }));

  console.log(`  ✓ ${f}`);
}

console.log('\n✅ Fertig.');
