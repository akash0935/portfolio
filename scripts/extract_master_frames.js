import { spawnSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';

const ffmpeg = ffmpegInstaller.path;
const videoPath = path.resolve('Video_Project.mp4');
const pubFramesDir = path.resolve('public/frames');
const rootFramesDir = path.resolve('frames');

[pubFramesDir, rootFramesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Extracting pristine 2560x1440 master frames from Video_Project.mp4...');
const t0 = Date.now();

// Extract frames at 2560x1440 with Lanczos scaling and highest JPEG quality (-q:v 2)
const res = spawnSync(ffmpeg, [
  '-i', videoPath,
  '-vf', 'scale=2560:1440:flags=lanczos',
  '-q:v', '2',
  path.join(pubFramesDir, 'frame_%03d.jpg')
]);

if (res.error) {
  console.error('Extraction error:', res.error);
  process.exit(1);
}

// Copy extracted frames to rootFramesDir as well
const files = fs.readdirSync(pubFramesDir).filter(f => f.endsWith('.jpg'));
console.log(`Extracted ${files.length} master frames to ${pubFramesDir}!`);

files.forEach(f => {
  fs.copyFileSync(path.join(pubFramesDir, f), path.join(rootFramesDir, f));
});

console.log(`Synchronized all ${files.length} frames to root/frames in ${((Date.now() - t0) / 1000).toFixed(2)}s!`);
