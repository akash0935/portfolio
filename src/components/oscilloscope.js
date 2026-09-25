export class AnalogWaveform {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.phase = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = this.canvas.offsetWidth;
    this.height = this.canvas.height = this.canvas.offsetHeight;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const w = this.width;
    const h = this.height;
    if (!w || !h) return;

    this.ctx.clearRect(0, 0, w, h);

    // Subtle dark grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    const stepX = w / 6;
    const stepY = h / 4;

    for (let x = 0; x < w; x += stepX) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += stepY) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Midline
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Warm Amber Analog Sine Wave
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#e5a93c';
    this.ctx.lineWidth = 2.2;
    this.ctx.shadowColor = '#e5a93c';
    this.ctx.shadowBlur = 6;

    const centerY = h / 2;
    const amp = h * 0.35;

    for (let x = 0; x < w; x++) {
      const angle = (x / w) * Math.PI * 4 + this.phase;
      const y = centerY + Math.sin(angle) * amp;

      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    this.phase += 0.045;
  }
}
