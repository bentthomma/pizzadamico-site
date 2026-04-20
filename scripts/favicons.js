// Generate PNG favicons + site.webmanifest from public/favicon.svg.
// Run: node scripts/favicons.js
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

const sizes = [
  { name: 'favicon-16.png',          size: 16 },
  { name: 'favicon-32.png',          size: 32 },
  { name: 'favicon-192.png',         size: 192 },
  { name: 'favicon-512.png',         size: 512 },
  { name: 'apple-touch-icon.png',    size: 180 },
];

async function main() {
  const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
  const svg = await fs.readFile(svgPath);

  for (const { name, size } of sizes) {
    const out = path.join(PUBLIC_DIR, name);
    await sharp(svg, { density: 300 })
      .resize(size, size, { fit: 'contain', background: { r: 20, g: 16, b: 12, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    const stat = await fs.stat(out);
    console.log(`  ${name.padEnd(28)} ${size}×${size}  ${(stat.size / 1024).toFixed(1)}KB`);
  }

  const manifest = {
    name: "Pizza D'Amico",
    short_name: "D'Amico",
    description: 'Neapolitanische Pizza · Catering & Foodtruck in der Schweiz',
    start_url: '/',
    display: 'standalone',
    background_color: '#14100C',
    theme_color: '#14100C',
    icons: [
      { src: '/favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicon.svg',     sizes: 'any',      type: 'image/svg+xml', purpose: 'any' },
    ],
  };
  await fs.writeFile(path.join(PUBLIC_DIR, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log(`  site.webmanifest written.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
