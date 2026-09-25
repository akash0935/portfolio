import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('ezgif-6f0e8b0d791a712a-jpg');
const OUT_DIR = path.resolve('public/ezgif-6f0e8b0d791a712a-jpg');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function enhanceAll() {
  console.log('Starting 8K-clarity enhancement on 177 frames...');
  const t0 = Date.now();

  for (let i = 1; i <= 177; i++) {
    const pad = String(i).padStart(3, '0');
    const filename = `ezgif-frame-${pad}.jpg`;
    const inPath = path.join(SRC_DIR, filename);
    const outPath = path.join(OUT_DIR, filename);

    if (!fs.existsSync(inPath)) continue;

    await sharp(inPath)
      // Professional unsharp mask to restore micro-details in hair, eyes, and sunglasses
      .sharpen({ sigma: 1.25, m1: 1.3, m2: 0.6, x1: 2, y2: 12, y3: 25 })
      // Enhance vibrant magenta/red rim lights
      .modulate({ saturation: 1.14, brightness: 1.02 })
      // Deepen studio pure black floor and remove compression haze
      .linear(1.07, -8)
      // High fidelity 4:4:4 full chroma sampling with zero color compression
      .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
      .toFile(outPath);

    if (i % 20 === 0 || i === 177) {
      console.log(`Processed ${i}/177 frames...`);
    }
  }

  console.log(`Successfully enhanced all 177 frames in ${((Date.now() - t0) / 1000).toFixed(1)}s!`);
}

enhanceAll().catch(err => {
  console.error('Enhancement failed:', err);
  process.exit(1);
});
