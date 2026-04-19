// Premium Cinematic Color-Grade für Gallery-Bilder
// Usage:
//   node scripts/color-grade.js --preview      → 3 Samples in .tmp/grade-preview/
//   node scripts/color-grade.js --all          → Alle Gallery-Bilder in-place (Backup: public/gallery/_originals/)
//
// Pipeline: Auto-Level → Gamma-Shadow-Lift → Color-Matrix (Warm) → Tone-Curve
//           → Saturation-Boost → Radial-Vignette → Re-encode alle 3 Formate

import sharp from 'sharp';
import { readdir, mkdir, copyFile, access, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GALLERY = path.join(ROOT, 'public', 'gallery');
const BACKUP = path.join(ROOT, 'public', 'gallery', '_originals');
const PREVIEW = path.join(ROOT, '.tmp', 'grade-preview');

// ── Grading-Parameter ──────────────────────────────
// Warm-Tungsten / Cinematic-Film / Moody Neapolitan
const GRADE = {
  // Auto-Level percentile clipping
  levelLow: 1,
  levelHigh: 99.2,

  // Gamma > 1 darkens, wir wollen lift → stattdessen via linear tone + Helligkeit.
  // (sharp erlaubt kein gamma < 1)

  // 3x3 Color-Matrix — subtiler warm-push, preserves neutrals
  // Rows: [R_from_RGB], [G_from_RGB], [B_from_RGB]
  colorMatrix: [
    [1.06,  0.03, -0.04],   // Red: gentle warmth
    [-0.01, 1.00, -0.01],   // Green: fast neutral
    [-0.04, -0.01, 0.95],   // Blue: subtle pull
  ],

  // Linear tone-curve: per-channel gain + offset
  // Subtle contrast + leichter R-lift / B-pull
  toneGain:   [1.025, 1.020, 0.995],
  toneOffset: [-2,    -2,     3],

  // Saturation & brightness (HSL-Space)
  saturation: 1.06,
  brightness: 0.98,

  // Output quality
  jpgQuality:  86,
  webpQuality: 84,
  avifQuality: 62,
};

// ── Vignette SVG ────────────────────────────────────
function vignetteSvg(w, h) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <radialGradient id="v" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="60%" stop-color="white" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#1a0f07" stop-opacity="0.38"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#v)"/>
    </svg>
  `);
}

// ── Pipeline ────────────────────────────────────────
async function gradeOne(inputPath) {
  const meta = await sharp(inputPath).metadata();
  const w = meta.width, h = meta.height;

  // Step 1-5: Color math in sharp pipeline
  const coreBuffer = await sharp(inputPath)
    .normalise({ lower: GRADE.levelLow, upper: GRADE.levelHigh })
    .recomb(GRADE.colorMatrix)
    .linear(GRADE.toneGain, GRADE.toneOffset)
    .modulate({ saturation: GRADE.saturation, brightness: GRADE.brightness })
    .toFormat('png') // lossless zwischen-format für composite
    .toBuffer();

  // Step 6: Vignette composite
  const withVignette = await sharp(coreBuffer)
    .composite([{ input: vignetteSvg(w, h), blend: 'multiply' }])
    .toFormat('png')
    .toBuffer();

  return withVignette;
}

async function atomicWrite(buffer, finalPath, formatFn) {
  const tmp = finalPath + '.gradetmp';
  await formatFn(sharp(buffer)).toFile(tmp);
  // Delete original first (Windows erlaubt keinen atomic rename ueber existing file)
  try { await unlink(finalPath); } catch { /* maybe new file */ }
  await rename(tmp, finalPath);
}

async function writeAllFormats(buffer, baseOutputPath) {
  const dir = path.dirname(baseOutputPath);
  const name = path.basename(baseOutputPath, path.extname(baseOutputPath));
  const jpgPath  = path.join(dir, `${name}.jpg`);
  const webpPath = path.join(dir, `${name}.webp`);
  const avifPath = path.join(dir, `${name}.avif`);

  // Sequential damit Vite-Watcher nicht 3 Files gleichzeitig reloaded
  await atomicWrite(buffer, jpgPath,  (s) => s.jpeg({ quality: GRADE.jpgQuality, mozjpeg: true }));
  await atomicWrite(buffer, webpPath, (s) => s.webp({ quality: GRADE.webpQuality }));
  await atomicWrite(buffer, avifPath, (s) => s.avif({ quality: GRADE.avifQuality }));
}

async function ensureBackup(srcJpg) {
  await mkdir(BACKUP, { recursive: true });
  const name = path.basename(srcJpg);
  const backupJpg = path.join(BACKUP, name);
  try {
    await access(backupJpg);
    // Already backed up — skip
  } catch {
    // Backup jpg + webp + avif
    const base = name.replace(/\.jpg$/, '');
    for (const ext of ['jpg', 'webp', 'avif']) {
      const srcExt = path.join(GALLERY, `${base}.${ext}`);
      const bakExt = path.join(BACKUP, `${base}.${ext}`);
      await copyFile(srcExt, bakExt).catch(() => {});
    }
  }
}

async function listJpgs(filter) {
  const files = await readdir(GALLERY);
  return files
    .filter(f => f.endsWith('.jpg'))
    .filter(f => filter ? f.startsWith(filter) : true)
    .sort();
}

// ── Main ────────────────────────────────────────────
const mode = process.argv[2] || '--help';

if (mode === '--preview') {
  await mkdir(PREVIEW, { recursive: true });
  const jpgs = (await listJpgs()).slice(0, 3);
  console.log(`Preview auf ${jpgs.length} Bildern →`, PREVIEW);

  for (const f of jpgs) {
    const src = path.join(GALLERY, f);
    const name = f.replace(/\.jpg$/, '');
    // Copy original
    await copyFile(src, path.join(PREVIEW, `${name}__before.jpg`));
    // Grade + write preview jpg only
    const graded = await gradeOne(src);
    await sharp(graded).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(PREVIEW, `${name}__after.jpg`));
    console.log(`  ✓ ${f}`);
  }
  console.log(`\nVergleich: ${PREVIEW}/<id>__before.jpg ↔ <id>__after.jpg`);
} else if (mode === '--filter') {
  const prefix = process.argv[3] || '';
  if (!prefix) { console.error('--filter braucht Prefix, z.B. pd-'); process.exit(1); }
  const jpgs = await listJpgs(prefix);
  console.log(`Grading ${jpgs.length} Bilder mit Prefix "${prefix}"`);
  for (const f of jpgs) {
    const src = path.join(GALLERY, f);
    await ensureBackup(src);
    const graded = await gradeOne(src);
    await writeAllFormats(graded, src);
    console.log(`  ✓ ${f}`);
  }
  console.log(`✅ Fertig.`);
} else if (mode === '--all') {
  const jpgs = await listJpgs();
  console.log(`Grading ${jpgs.length} Bilder (+ 3 Formate je) → ${jpgs.length * 3} Files total`);
  console.log(`Backup zu ${BACKUP}`);

  for (const f of jpgs) {
    const src = path.join(GALLERY, f);
    await ensureBackup(src);
    const graded = await gradeOne(src);
    await writeAllFormats(graded, src);
    console.log(`  ✓ ${f}`);
  }
  console.log(`\n✅ Fertig. Originale in ${BACKUP} (ignorierbar via .gitignore falls du willst).`);
} else {
  console.log(`Usage:
  node scripts/color-grade.js --preview   → 3 Samples in .tmp/grade-preview/
  node scripts/color-grade.js --all       → Alle 20 Gallery-Bilder in-place (mit Backup)
`);
}
