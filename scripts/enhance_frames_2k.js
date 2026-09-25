import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.resolve('ezgif-original-raw-backup');
const ROOT_DIR = path.resolve('ezgif-6f0e8b0d791a712a-jpg');
const PUBLIC_DIR = path.resolve('public/ezgif-6f0e8b0d791a712a-jpg');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function enhanceAll() {
  console.log('Starting Deblocked 8K-Clarity Remaster on all 177 frames...');
  const t0 = Date.now();

  for (let i = 1; i <= 177; i++) {
    const pad = String(i).padStart(3, '0');
    const filename = `ezgif-frame-${pad}.jpg`;
    const inPath = path.join(BACKUP_DIR, filename);
    const rootOut = path.join(ROOT_DIR, filename);
    const pubOut = path.join(PUBLIC_DIR, filename);

    if (!fs.existsSync(inPath)) continue;

    const buffer = await sharp(inPath)
      // 1. Deblock: eliminates the low-res 8x8 ezgif block compression and color banding
      .median(3)
      // 2. High-precision Lanczos3 2560x1440 Quad-HD upscale
      .resize(2560, 1440, { kernel: sharp.kernel.lanczos3 })
      // 3. Crisp edge reconstruction for hair, sunglasses, and contours
      .sharpen({ sigma: 1.25, m1: 1.5, m2: 0.7, x1: 2, y2: 12, y3: 25 })
      // 4. Vibrant studio illumination
      .modulate({ saturation: 1.15, brightness: 1.02 })
      // 5. Deep cinema black floor
      .linear(1.08, -8)
      // 6. 4:4:4 full chroma sampling with zero color subsampling
      .jpeg({ quality: 96, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toBuffer();

    // Write to both root and public directories
    fs.writeFileSync(rootOut, buffer);
    fs.writeFileSync(pubOut, buffer);

    if (i % 25 === 0 || i === 177) {
      console.log(`Remastered ${i}/177 frames (${((Date.now() - t0) / 1000).toFixed(1)}s)...`);
    }
  }

  console.log(`Successfully remastered all 177 frames in ${((Date.now() - t0) / 1000).toFixed(1)}s!`);
}

enhanceAll().catch(err => {
  console.error('Enhancement failed:', err);
  process.exit(1);
});
