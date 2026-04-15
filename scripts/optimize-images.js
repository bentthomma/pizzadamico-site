import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = 'src/images';
const QUALITY_AVIF = 62;
const QUALITY_WEBP = 78;

async function main() {
  const entries = await fs.readdir(SRC);
  let count = 0;
  for (const f of entries) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    const input = path.join(SRC, f);
    const stem = f.replace(/\.(jpe?g|png)$/i, '');
    const avif = path.join(SRC, `${stem}.avif`);
    const webp = path.join(SRC, `${stem}.webp`);

    try { await fs.stat(avif); } catch {
      await sharp(input).avif({ quality: QUALITY_AVIF, effort: 4 }).toFile(avif);
      console.log(`[img] ${f} → ${stem}.avif`);
    }
    try { await fs.stat(webp); } catch {
      await sharp(input).webp({ quality: QUALITY_WEBP, effort: 4 }).toFile(webp);
      console.log(`[img] ${f} → ${stem}.webp`);
    }
    count++;
  }
  console.log(`[img] processed ${count} sources`);
}

main().catch((e) => { console.error(e); process.exit(1); });
