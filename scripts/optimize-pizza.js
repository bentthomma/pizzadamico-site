// pizza-boden.jpg ist 1.8MB — shrink zu 78% quality + max 1600px
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

for (const base of ['pizza-boden', 'pizza-teig']) {
  const jpgPath = path.join(ROOT, 'src', 'images', `${base}.jpg`);
  const before = await sizeKb(jpgPath);
  const buf = await sharp(jpgPath).toBuffer();
  const resized = await sharp(buf).resize({ width: 1200, fit: 'inside', withoutEnlargement: true }).toBuffer();
  await atomicWrite(jpgPath, sharp(resized).jpeg({ quality: 78, mozjpeg: true }));
  await atomicWrite(path.join(ROOT, 'src', 'images', `${base}.avif`), sharp(resized).avif({ quality: 55, effort: 9 }));
  await atomicWrite(path.join(ROOT, 'src', 'images', `${base}.webp`), sharp(resized).webp({ quality: 72, effort: 6 }));
  console.log(`  ✓ ${base}: JPG ${before}KB → ${await sizeKb(jpgPath)}KB · AVIF ${await sizeKb(path.join(ROOT, 'src/images', base + '.avif'))}KB · WebP ${await sizeKb(path.join(ROOT, 'src/images', base + '.webp'))}KB`);
}
console.log('\n✅ Fertig.');
