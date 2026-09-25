import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Automatically use /portfolio/ on GitHub Actions / Pages, and ./ for local dev
  base: process.env.GITHUB_ACTIONS ? '/portfolio/' : './',
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        touchSensor: resolve(__dirname, 'project-touch-sensor.html'),
        laserDetection: resolve(__dirname, 'project-laser-detection.html'),
        homeAutomation: resolve(__dirname, 'project-home-automation.html')
      }
    }
  }
});
