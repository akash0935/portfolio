/**
 * Interactive Real-Time Analog Oscilloscope / Waveform Synthesizer
 * Provides an authentic ECE laboratory instrument experience with motion graphics
 */
export class OscilloscopeVisualizer {
  constructor(canvasId, controlsContainerId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.controls = document.getElementById(controlsContainerId);

    // Waveform state
    this.frequency = 2.4;
    this.amplitude = 0.75;
    this.phase = 0;
    this.waveType = 'sine'; // 'sine' | 'square' | 'triangle'
    this.noise = 0.04;
    this.isHovered = false;
    this.mouseMod = 0;

    // Responsive sizing
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.bindEvents();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height || 140;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      this.mouseMod = (x - 0.5) * 1.5;
      this.isHovered = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseMod = 0;
      this.isHovered = false;
    });

    // Frequency slider
    const freqInput = document.getElementById('oscFreqSlider');
    if (freqInput) {
      freqInput.addEventListener('input', (e) => {
        this.frequency = parseFloat(e.target.value);
        const readout = document.getElementById('oscFreqVal');
        if (readout) readout.textContent = `${(this.frequency * 18.5).toFixed(1)} kHz`;
      });
    }

    // Amplitude slider
    const ampInput = document.getElementById('oscAmpSlider');
    if (ampInput) {
      ampInput.addEventListener('input', (e) => {
        this.amplitude = parseFloat(e.target.value);
        const readout = document.getElementById('oscAmpVal');
        if (readout) readout.textContent = `${(this.amplitude * 3.3).toFixed(2)} Vpp`;
      });
    }

    // Wave type buttons
    const modeBtns = document.querySelectorAll('.osc-mode-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.waveType = btn.dataset.wave || 'sine';
      });
    });
  }

  calculateSample(xNorm, t) {
    const f = this.frequency + this.mouseMod;
    const phi = this.phase;
    const baseAngle = xNorm * Math.PI * 2 * f + phi;

    let y = 0;
    if (this.waveType === 'sine') {
      y = Math.sin(baseAngle) + 0.15 * Math.sin(baseAngle * 3.0);
    } else if (this.waveType === 'square') {
      // Bandlimited Fourier square approximation
      y = (4 / Math.PI) * (Math.sin(baseAngle) + (1 / 3) * Math.sin(baseAngle * 3) + (1 / 5) * Math.sin(baseAngle * 5));
    } else if (this.waveType === 'triangle') {
      y = (8 / (Math.PI * Math.PI)) * (Math.sin(baseAngle) - (1 / 9) * Math.sin(baseAngle * 3) + (1 / 25) * Math.sin(baseAngle * 5));
    }

    // Subtle thermal noise jitter
    const thermalJitter = (Math.random() - 0.5) * this.noise;
    return (y + thermalJitter) * this.amplitude;
  }

  drawGraticule() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle Cleanroom Dark-Glass Oscilloscope Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (8 divisions horizontal, 4 divisions vertical)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;

    const divX = w / 8;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * divX, 0);
      ctx.lineTo(i * divX, h);
      ctx.stroke();
    }

    const divY = h / 4;
    for (let j = 1; j < 4; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * divY);
      ctx.lineTo(w, j * divY);
      ctx.stroke();
    }

    // Center Reference Dotted Reticle Axis
    ctx.strokeStyle = 'rgba(194, 120, 82, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.canvas) return;

    this.phase += 0.06;
    this.drawGraticule();

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const midY = h / 2;
    const maxPixelAmp = (h / 2) * 0.78;

    // Glowing phosphorescent trace
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 10;
    ctx.beginPath();

    const steps = 140;
    for (let i = 0; i <= steps; i++) {
      const xNorm = i / steps;
      const px = xNorm * w;
      const sample = this.calculateSample(xNorm, this.phase);
      const py = midY - sample * maxPixelAmp;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Lead beam dot
    const leadSample = this.calculateSample(1.0, this.phase);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(w - 2, midY - leadSample * maxPixelAmp, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
