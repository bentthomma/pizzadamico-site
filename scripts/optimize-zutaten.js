// Optimize Zutaten-PNGs zu AVIF + WebP + kompakter PNG-Fallback
// Die PNGs liegen aktuell als 2-2.5MB unkomprimiert in public/zutaten/
// Ziel: ~200-400KB je Bild (10× kleiner)

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

const files = (await readdir(SRC)).filter(f => f.endsWith('.png')).sort();
console.log(`Optimizing ${files.length} PNGs → AVIF + WebP + tiny PNG`);

for (const f of files) {
  const srcPath = path.join(SRC, f);
  const base = f.replace(/\.png$/, '');
  const buffer = await sharp(srcPath).toBuffer();

  // Resize wenn > 600px (Zutat-Cards max ~150px, 2× retina = 300, 600 ist reichlich)
  const resized = await sharp(buffer).resize({
    width: 600,
    height: 600,
    fit: 'inside',
    withoutEnlargement: true,
  }).toBuffer();

  // AVIF: beste Kompression
  await atomicConvert(resized, path.join(SRC, `${base}.avif`),
    (s) => s.avif({ quality: 60, effort: 6 }));

  // WebP Fallback
  await atomicConvert(resized, path.join(SRC, `${base}.webp`),
    (s) => s.webp({ quality: 82, effort: 6 }));

  // PNG neu encodiert (für Alpha, kompakt)
  await atomicConvert(resized, path.join(SRC, `${base}.png`),
    (s) => s.png({ compressionLevel: 9, palette: true, quality: 82 }));

  console.log(`  ✓ ${f}`);
}

console.log('\n✅ Fertig. Check sizes:');
