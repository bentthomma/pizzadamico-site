// One-off: extract square TWINT QR from 1530×767 banner → twint-qr-square.png
import sharp from 'sharp';
import path from 'node:path';

const IN = path.resolve('src/images/twint-qr.png');
const OUT = path.resolve('src/images/twint-qr-square.png');

const meta = await sharp(IN).metadata();
console.log('input', meta.width, meta.height);

// QR takes roughly left 35% of width with some white padding; height = full.
// Natural banner: 1530×767. QR area ≈ 0 .. 567 wide × full height (767)
// We crop square 700×700 from the left, centered vertically, with 30px padding.
// QR + Twint-label only (no right-side text)
const cropX = 30;
const cropY = 30;
const cropW = 530;
const cropH = 707;

console.log('cropping', { cropX, cropY, cropW, cropH });

await sharp(IN)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize({ width: 600, height: 600 })
  .png()
  .toFile(OUT);

console.log('wrote', OUT);
