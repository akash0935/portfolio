import * as THREE from 'three';

export class RobotCompanion {
  constructor() {
    this.group = new THREE.Group();
    this.lookTarget = new THREE.Vector2(0, 0);
    this.currentLook = new THREE.Vector2(0, 0);
    
    // Animation states
    this.blinkTimer = 0;
    this.nextBlinkTime = 2.5 + Math.random() * 2;
    this.isBlinking = false;
    this.blinkProgress = 0;
    
    this.isSpinning = false;
    this.spinAngle = 0;
    this.isWaving = false;
    this.waveTimer = 0;

    this.initMaterials();
    this.buildEyeCanvas();
    this.buildRobot();
  }

  initMaterials() {
    // 1. Pristine Cleanroom White Ceramic
    this.ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.08
    });

    // 2. Polished Rose-Copper Joint Metal
    this.copperMat = new THREE.MeshStandardMaterial({
      color: 0xc27852,
      roughness: 0.18,
      metalness: 0.94
    });

    // 3. Dark Curved Visor Glass
    this.visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.2,
      transparent: true,
      opacity: 0.95
    });

    // 4. Luminous Cyan Glowing Materials
    this.cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    this.copperGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffa07a,
      transparent: true,
      opacity: 0.7
    });
  }

  buildEyeCanvas() {
    // Dynamic canvas for expressive digital LED eyes
    this.eyeCanvas = document.createElement('canvas');
    this.eyeCanvas.width = 256;
    this.eyeCanvas.height = 128;
    this.eyeCtx = this.eyeCanvas.getContext('2d');

    this.eyeTexture = new THREE.CanvasTexture(this.eyeCanvas);
    this.eyeTexture.minFilter = THREE.LinearFilter;
    this.eyeTexture.magFilter = THREE.LinearFilter;

    this.eyeMat = new THREE.MeshBasicMaterial({
      map: this.eyeTexture,
      transparent: true,
      opacity: 0.98
    });

    this.renderEyes(0, 0, 1);
  }

  renderEyes(offsetX = 0, offsetY = 0, eyeScaleY = 1, isHappy = false) {
    const ctx = this.eyeCtx;
    const w = this.eyeCanvas.width;
    const h = this.eyeCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Glowing cyan digital LED eye color
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 14;

    const eyeWidth = 24;
    const eyeHeight = 36 * eyeScaleY;
    const eyeSpacing = 42;
    const centerY = h / 2 + offsetY * 8;

    if (isHappy) {
      // Curved smiling eyes (inverted arc)
      ctx.lineWidth = 8 * eyeScaleY;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(w / 2 - eyeSpacing + offsetX * 10, centerY, 16, Math.PI * 0.15, Math.PI * 0.85, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w / 2 + eyeSpacing + offsetX * 10, centerY, 16, Math.PI * 0.15, Math.PI * 0.85, false);
      ctx.stroke();
    } else {
      // Rounded pill LED eyes with slight pupil dilation
      // Left eye
      const leftX = w / 2 - eyeSpacing - eyeWidth / 2 + offsetX * 12;
      const leftY = centerY - eyeHeight / 2;
      ctx.beginPath();
      ctx.roundRect(leftX, leftY, eyeWidth, Math.max(3, eyeHeight), 12);
      ctx.fill();

      // Right eye
      const rightX = w / 2 + eyeSpacing - eyeWidth / 2 + offsetX * 12;
      const rightY = centerY - eyeHeight / 2;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, eyeWidth, Math.max(3, eyeHeight), 12);
      ctx.fill();
    }

    this.eyeTexture.needsUpdate = true;
  }

  buildRobot() {
    this.robotContainer = new THREE.Group();
    this.group.add(this.robotContainer);

    // ── 1. Head Assembly ──
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.45, 0);
    this.robotContainer.add(this.headGroup);

    // Outer Ceramic Helmet
    const helmetGeo = new THREE.SphereGeometry(0.72, 32, 28);
    helmetGeo.scale(1.05, 0.98, 0.98);
    this.helmet = new THREE.Mesh(helmetGeo, this.ceramicMat);
    this.headGroup.add(this.helmet);

    // Copper Visor Bezel Ring
    const bezelGeo = new THREE.TorusGeometry(0.55, 0.038, 16, 48);
    bezelGeo.scale(1.15, 0.88, 0.5);
    const visorBezel = new THREE.Mesh(bezelGeo, this.copperMat);
    visorBezel.position.set(0, 0, 0.42);
    this.headGroup.add(visorBezel);

    // Dark Visor Face Screen
    const visorGeo = new THREE.SphereGeometry(0.68, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    visorGeo.scale(1.0, 0.82, 0.58);
    this.visor = new THREE.Mesh(visorGeo, this.visorMat);
    this.visor.rotation.x = Math.PI / 2;
    this.visor.position.set(0, 0, 0.38);
    this.headGroup.add(this.visor);

    // Dynamic LED Eye Display Plane
    const eyePlaneGeo = new THREE.PlaneGeometry(0.75, 0.38);
    this.eyeMesh = new THREE.Mesh(eyePlaneGeo, this.eyeMat);
    this.eyeMesh.position.set(0, 0.02, 0.69);
    this.headGroup.add(this.eyeMesh);

    // Ear Comms Disc (Left & Right)
    const earGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 24);
    const earDiscL = new THREE.Mesh(earGeo, this.copperMat);
    earDiscL.rotation.z = Math.PI / 2;
    earDiscL.position.set(-0.76, 0, 0);
    this.headGroup.add(earDiscL);

    const earDiscR = new THREE.Mesh(earGeo, this.copperMat);
    earDiscR.rotation.z = Math.PI / 2;
    earDiscR.position.set(0.76, 0, 0);
    this.headGroup.add(earDiscR);

    // Ear Indicator LED (Cyan)
    const earLedGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.09, 16);
    const earLedL = new THREE.Mesh(earLedGeo, this.cyanGlowMat);
    earLedL.rotation.z = Math.PI / 2;
    earLedL.position.set(-0.77, 0, 0);
    this.headGroup.add(earLedL);

    const earLedR = new THREE.Mesh(earLedGeo, this.cyanGlowMat);
    earLedR.rotation.z = Math.PI / 2;
    earLedR.position.set(0.77, 0, 0);
    this.headGroup.add(earLedR);

    // Cute Rose-Copper Antenna on Left
    const antStemGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.35, 12);
    const antennaStem = new THREE.Mesh(antStemGeo, this.copperMat);
    antennaStem.position.set(-0.62, 0.45, -0.1);
    antennaStem.rotation.z = 0.35;
    this.headGroup.add(antennaStem);

    const antTipGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const antTip = new THREE.Mesh(antTipGeo, this.copperGlowMat);
    antTip.position.set(-0.74, 0.62, -0.1);
    this.headGroup.add(antTip);

    // ── 2. Neck Ball Joint ──
    const neckGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const neck = new THREE.Mesh(neckGeo, this.copperMat);
    neck.position.set(0, 0.88, 0);
    this.robotContainer.add(neck);

    // ── 3. Torso Assembly ──
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.45, 0);
    this.robotContainer.add(this.torsoGroup);

    // Ceramic Main Torso Body
    const bodyGeo = new THREE.SphereGeometry(0.64, 28, 24);
    bodyGeo.scale(0.95, 1.15, 0.85);
    const body = new THREE.Mesh(bodyGeo, this.ceramicMat);
    this.torsoGroup.add(body);

    // Chest Copper Trim & Quantum Energy Core
    const chestPlateGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24);
    chestPlateGeo.rotateX(Math.PI / 2);
    const chestRing = new THREE.Mesh(chestPlateGeo, this.copperMat);
    chestRing.position.set(0, 0.12, 0.52);
    this.torsoGroup.add(chestRing);

    const coreGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20);
    coreGeo.rotateX(Math.PI / 2);
    this.coreLed = new THREE.Mesh(coreGeo, this.cyanGlowMat);
    this.coreLed.position.set(0, 0.12, 0.53);
    this.torsoGroup.add(this.coreLed);

    // ── 4. Floating Articulated Arms ──
    // Right Arm (Engineering Probe Stylus Hand)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.72, 0.2, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const shoulderRGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const shoulderR = new THREE.Mesh(shoulderRGeo, this.copperMat);
    this.rightArmGroup.add(shoulderR);

    const armGeo = new THREE.CapsuleGeometry(0.1, 0.38, 12, 16);
    const armR = new THREE.Mesh(armGeo, this.ceramicMat);
    armR.position.set(0.12, -0.25, 0.15);
    armR.rotation.x = -0.5;
    armR.rotation.z = -0.2;
    this.rightArmGroup.add(armR);

    // Hardware Stylus / Calibration Probe in Right Hand
    const stylusGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 12);
    stylusGeo.rotateX(Math.PI / 4);
    const stylus = new THREE.Mesh(stylusGeo, this.copperMat);
    stylus.position.set(0.24, -0.36, 0.38);
    this.rightArmGroup.add(stylus);

    const stylusTipGeo = new THREE.ConeGeometry(0.035, 0.08, 12);
    stylusTipGeo.rotateX(-Math.PI / 4 * 3);
    const stylusTip = new THREE.Mesh(stylusTipGeo, this.cyanGlowMat);
    stylusTip.position.set(0.35, -0.52, 0.54);
    this.rightArmGroup.add(stylusTip);

    // Left Arm (Floating Rest or Wave Arm)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.72, 0.2, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const shoulderLGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const shoulderL = new THREE.Mesh(shoulderLGeo, this.copperMat);
    this.leftArmGroup.add(shoulderL);

    const armL = new THREE.Mesh(armGeo, this.ceramicMat);
    armL.position.set(-0.12, -0.25, 0.08);
    armL.rotation.x = -0.15;
    armL.rotation.z = 0.25;
    this.leftArmGroup.add(armL);

    // ── 5. Dual Anti-Gravity Hover Propulsion Rings ──
    this.ringsGroup = new THREE.Group();
    this.ringsGroup.position.set(0, -0.65, 0);
    this.torsoGroup.add(this.ringsGroup);

    const ring1Geo = new THREE.TorusGeometry(0.48, 0.028, 16, 36);
    ring1Geo.rotateX(Math.PI / 2);
    this.antiGravRing1 = new THREE.Mesh(ring1Geo, this.cyanGlowMat);
    this.ringsGroup.add(this.antiGravRing1);

    const ring2Geo = new THREE.TorusGeometry(0.32, 0.022, 16, 36);
    ring2Geo.rotateX(Math.PI / 2);
    this.antiGravRing2 = new THREE.Mesh(ring2Geo, this.copperGlowMat);
    this.antiGravRing2.position.set(0, -0.18, 0);
    this.ringsGroup.add(this.antiGravRing2);
  }

  triggerSpin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.spinAngle = 0;
  }

  setWaving(isWaving) {
    this.isWaving = isWaving;
  }

  setLookTarget(x, y) {
    // Normalised -1 to 1 screen coords
    this.lookTarget.set(
      THREE.MathUtils.clamp(x, -1.2, 1.2),
      THREE.MathUtils.clamp(y, -1.0, 1.0)
    );
  }

  update(delta, time) {
    // 1. Smooth Look-at Interpolation
    this.currentLook.lerp(this.lookTarget, 0.08);

    // Rotate head smoothly to track cursor
    this.headGroup.rotation.y = this.currentLook.x * 0.45;
    this.headGroup.rotation.x = -this.currentLook.y * 0.35;
    this.headGroup.rotation.z = -this.currentLook.x * 0.08;

    // Body follows head slightly
    this.torsoGroup.rotation.y = this.currentLook.x * 0.18;
    this.torsoGroup.rotation.x = -this.currentLook.y * 0.12;

    // 2. Eye Blinking Logic
    this.blinkTimer += delta;
    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = 0;
      this.nextBlinkTime = 3.0 + Math.random() * 2.5;
    }

    let eyeScaleY = 1.0;
    if (this.isBlinking) {
      this.blinkProgress += delta * 7.5; // ~130ms blink
      if (this.blinkProgress < 1.0) {
        eyeScaleY = Math.sin(this.blinkProgress * Math.PI);
        eyeScaleY = THREE.MathUtils.lerp(1.0, 0.05, eyeScaleY);
      } else {
        this.isBlinking = false;
        eyeScaleY = 1.0;
      }
    }

    // Render eyes with eye-tracking offset
    this.renderEyes(this.currentLook.x * 0.5, -this.currentLook.y * 0.4, eyeScaleY, this.isWaving);

    // 3. Ambient Floating & Anti-Gravity Ring Rotations
    const floatOffset = Math.sin(time * 2.2) * 0.07;
    this.robotContainer.position.y = floatOffset;

    this.antiGravRing1.rotation.y = time * 2.5;
    this.antiGravRing1.rotation.z = Math.sin(time * 3) * 0.1;
    this.antiGravRing2.rotation.y = -time * 3.2;

    // Heart core pulse
    const corePulse = 0.65 + Math.sin(time * 4) * 0.35;
    this.coreLed.material.opacity = corePulse;

    // 4. Click Spin Action
    if (this.isSpinning) {
      this.spinAngle += delta * 12;
      this.robotContainer.rotation.y = this.spinAngle;
      if (this.spinAngle >= Math.PI * 2) {
        this.spinAngle = 0;
        this.robotContainer.rotation.y = 0;
        this.isSpinning = false;
      }
    }

    // 5. Waving Interaction
    if (this.isWaving) {
      this.leftArmGroup.rotation.x = -1.2 + Math.sin(time * 10) * 0.4;
      this.leftArmGroup.rotation.z = 0.8 + Math.cos(time * 10) * 0.3;
    } else {
      this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, 0.1);
      this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(this.leftArmGroup.rotation.z, 0, 0.1);
    }
  }
}
