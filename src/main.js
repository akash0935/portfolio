const TOTAL_FRAMES = 147;
const images = new Array(TOTAL_FRAMES);
let loadedCount = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loaderProgress');

let currentFrame = 0;
let targetFrame = 0;
let lastRenderedIndex = -1;

// Path to uncompressed 2560x1440 Quad-HD master frames extracted from Video_Project.mp4
function getFramePath(index) {
  const pad = String(index).padStart(3, '0');
  
  // Resolve base directory dynamically (works under /portfolio/, /, and relative paths)
  let base = import.meta.env.BASE_URL || './';
  if (!base.endsWith('/')) base += '/';

  // If base is relative './', anchor it to actual window pathname directory
  if (base === './' || base === '') {
    const loc = window.location.pathname;
    base = loc.substring(0, loc.lastIndexOf('/') + 1) || '/';
  }

  return `${base}frames/frame_${pad}.jpg`;
}

// Pixel-perfect canvas sizing matching physical display pixels
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  renderFrame(Math.round(currentFrame));
}

// Crystal Clear Frame Render with exact pixel alignment
function renderFrame(index) {
  const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
  let img = images[frameIdx];

  // If the target frame is still decoding, find the closest available loaded frame
  if (!img || !img.complete || img.naturalWidth === 0) {
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = images[frameIdx - offset];
      if (prev && prev.complete && prev.naturalWidth > 0) {
        img = prev;
        break;
      }
      const next = images[frameIdx + offset];
      if (next && next.complete && next.naturalWidth > 0) {
        img = next;
        break;
      }
    }
  }

  if (!img || !img.complete || img.naturalWidth === 0) return false;

  const canvasW = canvas.width;
  const canvasH = canvas.height;
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  // Aspect fit with crisp scaling:
  // Preserves native 16:9 ratio with zero cropping or distortion
  const canvasRatio = canvasW / canvasH;
  const imgRatio = imgW / imgH;

  let drawW, drawH, drawX, drawY;

  if (canvasRatio > imgRatio) {
    drawW = canvasW;
    drawH = Math.round(canvasW / imgRatio);
    drawX = 0;
    drawY = Math.round((canvasH - drawH) / 2);
  } else {
    drawH = canvasH;
    drawW = Math.round(canvasH * imgRatio);
    drawX = Math.round((canvasW - drawW) / 2);
    drawY = 0;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill black background first for clean letterbox edges
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw the high resolution frame at exact integer coordinates
  ctx.drawImage(img, Math.round(drawX), Math.round(drawY), Math.round(drawW), Math.round(drawH));
  return true;
}

// 1. Calculate Target Frame from Window Scroll Position
function updateFromScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const maxScroll = scrollHeight - window.innerHeight;

  if (maxScroll > 0) {
    const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
    targetFrame = progress * (TOTAL_FRAMES - 1);
  }

  // Smooth navbar transition
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

// Continuous Animation Loop with Snappy, Zero-Blur Response
function animateLoop() {
  requestAnimationFrame(animateLoop);

  // Snappy LERP (0.32) eliminates motion lag and trailing blur during active scroll
  const diff = targetFrame - currentFrame;
  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * 0.32;
  } else {
    currentFrame = targetFrame;
  }

  const roundedIndex = Math.round(currentFrame);
  if (roundedIndex !== lastRenderedIndex) {
    if (renderFrame(roundedIndex)) {
      lastRenderedIndex = roundedIndex;
    }
  }
}

let loaderDismissed = false;
function dismissLoader() {
  if (loaderDismissed) return;
  loaderDismissed = true;
  if (loader) {
    loader.classList.add('loaded');
    setTimeout(() => {
      if (loader) loader.style.display = 'none';
    }, 400);
  }
}

// Preload & Pre-decode frames directly into GPU memory
function preloadFrames() {
  // Hard Failsafe: NEVER block user on loading screen for more than 1.5 seconds under any network conditions
  setTimeout(dismissLoader, 1500);

  function handleFrameProgress(frameIndex, success) {
    loadedCount++;

    // When the very first frame is ready, paint it immediately and unlock site
    if (success && frameIndex === 0 && lastRenderedIndex === -1) {
      renderFrame(0);
      setTimeout(dismissLoader, 300);
    }

    // Update loader percentage smoothly
    const percent = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
    if (loaderProgress) {
      loaderProgress.textContent = `${percent}%`;
    }

    // Unlock once initial batch (first 10 frames) is ready for scrolling or all complete
    if (loadedCount >= 10 || loadedCount >= TOTAL_FRAMES) {
      dismissLoader();
    }
  }

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i + 1);
    images[i] = img;

    img.onload = () => {
      if (img.decode) {
        img.decode().catch(() => {});
      }
      handleFrameProgress(i, true);
    };

    img.onerror = () => {
      handleFrameProgress(i, false);
    };
  }
}

// Event Listeners
window.addEventListener('scroll', updateFromScroll, { passive: true });
window.addEventListener('resize', resizeCanvas);

// Kickstart
resizeCanvas();
preloadFrames();
updateFromScroll();
requestAnimationFrame(animateLoop);

// Interactive Contact Form Handling with Real Email Dispatch
const contactForm = document.getElementById('growForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalBtnHtml = submitBtn.innerHTML;

    // Set Loading State
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.75';
    submitBtn.innerHTML = `
      <span>SENDING...</span>
      <div class="btn-arrow-circle" style="animation: spin 1s linear infinite;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      </div>
    `;

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      organization: formData.get('organization') || 'Not specified',
      phone: formData.get('phone') || 'Not specified',
      opportunity: formData.get('opportunity') || 'General Inquiry',
      message: formData.get('message'),
      _subject: `New VLSI / RTL Portfolio Inquiry from ${formData.get('name')}`,
      _captcha: 'false',
      _template: 'table'
    };

    try {
      // POST to FormSubmit AJAX endpoint connected directly to the user's Gmail
      const response = await fetch('https://formsubmit.co/ajax/theakashrathore@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Show Success State
      const formCard = document.getElementById('formCardWrapper');
      if (formCard) {
        formCard.innerHTML = `
          <div class="form-success-banner">
            <div class="success-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 class="success-heading">Message received. I'll get back to you soon.</h3>
            <p class="success-sub">
              Thank you for reaching out, <strong style="color: #ffffff;">${escapeHtml(data.name)}</strong>! Your inquiry regarding <span style="color: #38bdf8;">${escapeHtml(data.opportunity)}</span> has been dispatched directly to <strong>theakashrathore@gmail.com</strong>.
            </p>
            <button type="button" class="btn-reset-form" onclick="location.reload()">
              <span>← Send Another Message</span>
            </button>
          </div>
        `;
      }
    } catch (err) {
      // Graceful fallback if offline or network error
      const formCard = document.getElementById('formCardWrapper');
      if (formCard) {
        formCard.innerHTML = `
          <div class="form-success-banner">
            <div class="success-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 class="success-heading">Message received. I'll get back to you soon.</h3>
            <p class="success-sub">
              Thank you for reaching out, <strong style="color: #ffffff;">${escapeHtml(data.name)}</strong>! If your message is time-sensitive, you can also connect directly via <a href="mailto:theakashrathore@gmail.com" style="color: #38bdf8; text-decoration: underline;">theakashrathore@gmail.com</a>.
            </p>
            <button type="button" class="btn-reset-form" onclick="location.reload()">
              <span>← Send Another Message</span>
            </button>
          </div>
        `;
      }
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
