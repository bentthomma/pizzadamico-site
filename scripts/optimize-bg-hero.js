// Optimize bg-images: akt3-bg.png + pietro-hero.png → AVIF/WebP/JPG
// akt3-bg.png: 2.5MB → AVIF ~120-200KB via CSS image-set()
// pietro-hero.png: 2.0MB → AVIF ~80-150KB via <picture>

import sharp from 'sharp';
import { rename, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public');

async function atomicWrite(out, formatFn) {
  const tmp = out + '.tmp';
  await formatFn.toFile(tmp);
  try { await unlink(out); } catch {}
  await rename(tmp, out);
}

async function sizeKb(p) {
  try { return Math.round((await stat(p)).size / 1024); } catch { return 0; }
}

async function convert(src, max, qA, qW, qJ) {
  const base = src.replace(/\.(png|jpg|jpeg)$/i, '');
  const buf = await sharp(src).toBuffer();
  const resized = await sharp(buf).resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).toBuffer();

  await atomicWrite(base + '.avif', sharp(resized).avif({ quality: qA, effort: 9 }));
  await atomicWrite(base + '.webp', sharp(resized).webp({ quality: qW, effort: 6 }));
  await atomicWrite(base + '.jpg',  sharp(resized).jpeg({ quality: qJ, mozjpeg: true }));

  return {
    avif: await sizeKb(base + '.avif'),
    webp: await sizeKb(base + '.webp'),
    jpg:  await sizeKb(base + '.jpg'),
  };
}

console.log('Optimizing background + hero images...');

// akt3-bg — CSS background, 2500px wide max plenty für 4K
const akt3Before = await sizeKb(path.join(PUB, 'akt3-bg.png'));
const akt3 = await convert(path.join(PUB, 'akt3-bg.png'), 2400, 55, 72, 82);
console.log(`  ✓ akt3-bg: PNG ${akt3Before}KB → AVIF ${akt3.avif}KB · WebP ${akt3.webp}KB · JPG ${akt3.jpg}KB`);

// pietro-hero — image in modal-geschichte, 1600px wide max (displayed ~500-800px)
const pietroBefore = await sizeKb(path.join(PUB, 'pietro-hero.png'));
const pietro = await convert(path.join(PUB, 'pietro-hero.png'), 1600, 55, 72, 82);
console.log(`  ✓ pietro-hero: PNG ${pietroBefore}KB → AVIF ${pietro.avif}KB · WebP ${pietro.webp}KB · JPG ${pietro.jpg}KB`);

console.log('\n✅ Fertig.');
