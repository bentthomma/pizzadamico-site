// Re-optimize restliche Zutaten (caputo-rossa, fior-di-latte, olio-doliva)
// + Foodtruck JPG shrinken
import sharp from 'sharp';
import { rename, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function atomicWrite(out, formatFn) {
  const tmp = out + '.tmp';
  await formatFn.toFile(tmp);
  try { await unlink(out); } catch {}
  await rename(tmp, out);
}
async function sizeKb(p) { try { return Math.round((await stat(p)).size / 1024); } catch { return 0; } }

// 3 zusätzliche Zutaten (Akt-3-Grid, nicht im Wizard-Pool)
const ZUTATEN_EXTRA = ['caputo-rossa', 'fior-di-latte', 'olio-doliva'];
for (const id of ZUTATEN_EXTRA) {
  const pngPath = path.join(ROOT, 'public', 'zutaten', `${id}.png`);
  const before = await sizeKb(pngPath);
  const buf = await sharp(pngPath).toBuffer();
  const resized = await sharp(buf).resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true }).toBuffer();
  await atomicWrite(path.join(ROOT, 'public', 'zutaten', `${id}.avif`), sharp(resized).avif({ quality: 40, effort: 9 }));
  await atomicWrite(path.join(ROOT, 'public', 'zutaten', `${id}.webp`), sharp(resized).webp({ quality: 70, effort: 6 }));
  await atomicWrite(pngPath, sharp(resized).png({ compressionLevel: 9, palette: true, quality: 75 }));
  console.log(`  ✓ ${id}: PNG ${before}KB → ${await sizeKb(pngPath)}KB`);
}

// Foodtruck JPG shrinken — wird als <img src> fallback genutzt, aber aktuell 2.2MB
// Resize auf 1800px max (aktuell 2000x1333), quality 78
const ftPath = path.join(ROOT, 'src', 'images', 'foodtruck.jpg');
const ftBefore = await sizeKb(ftPath);
const ftBuf = await sharp(ftPath).toBuffer();
const ftResized = await sharp(ftBuf).resize({ width: 1800, fit: 'inside', withoutEnlargement: true }).toBuffer();
await atomicWrite(ftPath, sharp(ftResized).jpeg({ quality: 78, mozjpeg: true }));
// Re-do AVIF + WebP in bessere Qualität für die small source
await atomicWrite(path.join(ROOT, 'src', 'images', 'foodtruck.avif'), sharp(ftResized).avif({ quality: 55, effort: 9 }));
await atomicWrite(path.join(ROOT, 'src', 'images', 'foodtruck.webp'), sharp(ftResized).webp({ quality: 72, effort: 6 }));
console.log(`  ✓ foodtruck.jpg: ${ftBefore}KB → ${await sizeKb(ftPath)}KB`);
console.log(`  ✓ foodtruck.avif: ${await sizeKb(path.join(ROOT, 'src/images/foodtruck.avif'))}KB`);
console.log(`  ✓ foodtruck.webp: ${await sizeKb(path.join(ROOT, 'src/images/foodtruck.webp'))}KB`);

console.log('\n✅ Fertig.');
