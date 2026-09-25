import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
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
