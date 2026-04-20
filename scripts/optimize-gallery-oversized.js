// Re-optimize Top-10 oversized Gallery-AVIFs + fix broken WebPs (WebP > JPG)
// Re-encode from JPG-source (quality 55 AVIF, 72 WebP, max 2000px)

import sharp from 'sharp';
import { rename, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GAL = path.join(ROOT, 'public', 'gallery');

// Oversized AVIFs (>200KB) + broken WebPs (>JPG)
const TARGETS = [
  'a3a7ea0e-68ac-4268-b0f4-c77684f2973b',
  '2c8981e0-76ee-4492-9d47-3c1613b5e2b4',
  'dd029010-cf76-4922-ab15-3bf24c8a5189',
  'a864851c-b064-4e9b-a6bf-0f760d440a75',
  'pd-18',
  'pd-12',
  'f82bba34-ece5-4120-8e8a-0de3bb1949ea',
  'c0a74682-967b-418c-b5c7-de08193d5134',
  '21b41d96-9c38-4708-85a7-f5668cdbfe39',
  'f9b69ab4-ff4e-44c2-9ca5-390a86bfa6cd',
  'd3b80b88-a275-464c-b44f-ef62cc6c13a1',
  'pd-14',
  'pd-10',
  'pd-17',
  '407a9b94-858e-4f77-9219-18b278db6479',
];

async function atomicConvert(buffer, finalPath, formatFn) {
  const tmp = finalPath + '.tmp';
  await formatFn(sharp(buffer)).toFile(tmp);
  try { await unlink(finalPath); } catch {}
  await rename(tmp, finalPath);
}

async function sizeKb(p) {
  try { return Math.round((await stat(p)).size / 1024); } catch { return 0; }
}

console.log(`Re-encoding ${TARGETS.length} gallery images (AVIF q=55, WebP q=72, 2000px max)`);

for (const id of TARGETS) {
  const jpgPath = path.join(GAL, `${id}.jpg`);
  const avifPath = path.join(GAL, `${id}.avif`);
  const webpPath = path.join(GAL, `${id}.webp`);

  try {
    const before = { avif: await sizeKb(avifPath), webp: await sizeKb(webpPath), jpg: await sizeKb(jpgPath) };

    const buffer = await sharp(jpgPath).toBuffer();
    const resized = await sharp(buffer).resize({
      width: 2000,
      height: 2000,
      fit: 'inside',
      withoutEnlargement: true,
    }).toBuffer();

    await atomicConvert(resized, avifPath, (s) => s.avif({ quality: 55, effort: 9 }));
    await atomicConvert(resized, webpPath, (s) => s.webp({ quality: 72, effort: 6 }));

    const after = { avif: await sizeKb(avifPath), webp: await sizeKb(webpPath) };
    console.log(`  ✓ ${id}: AVIF ${before.avif}→${after.avif}KB · WebP ${before.webp}→${after.webp}KB`);
  } catch (err) {
    console.error(`  ✗ ${id}: ${err.message}`);
  }
}

console.log('\n✅ Fertig.');
