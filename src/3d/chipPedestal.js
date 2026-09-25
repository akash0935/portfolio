import * as THREE from 'three';

export class ChipPedestal {
  constructor() {
    this.group = new THREE.Group();
    this.pinsPerSide = 8;
    this.tracePoints = [];
    this.pulseParticles = [];

    this.initMaterials();
    this.buildPedestalAndChip();
    this.buildCircuitPulses();
  }

  initMaterials() {
    // 1. Frosted Translucent Glass Platform
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.14,
      ior: 1.52,
      thickness: 0.45,
      specularIntensity: 1.0,
      specularColor: 0xffffff
    });

    // 2. White Ceramic IC Package Body
    this.ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.32,
      metalness: 0.06
    });

    // 3. Center Metallic Heat Spreader / Die Cap
    this.capMat = new THREE.MeshStandardMaterial({
      color: 0xead5c3, // Champagne rose
      metalness: 0.94,
      roughness: 0.16
    });

    // 4. Polished Rose-Copper Pins and Traces
    this.copperMat = new THREE.MeshStandardMaterial({
      color: 0xc27852,
      metalness: 0.95,
      roughness: 0.15
    });

    // 5. Electric Signal Pulse Material
    this.pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });
  }

  buildPedestalAndChip() {
    // ── 1. Frosted Glass Pedestal Substrate ──
    const glassW = 3.6;
    const glassD = 0.1;
    const glassGeo = new THREE.BoxGeometry(glassW, glassW, glassD);
    this.glassPlate = new THREE.Mesh(glassGeo, this.glassMat);
    this.glassPlate.rotation.x = -Math.PI / 2;
    this.group.add(this.glassPlate);

    // ── 2. Pristine White Ceramic Package Body ──
    const chipSize = 1.5;
    const chipThickness = 0.2;
    const chipGeo = new THREE.BoxGeometry(chipSize, chipSize, chipThickness);
    this.chipBody = new THREE.Mesh(chipGeo, this.ceramicMat);
    this.chipBody.position.y = chipThickness / 2 + glassD / 2;
    this.chipBody.rotation.x = -Math.PI / 2;
    this.group.add(this.chipBody);

    // ── 3. Center Metallic Heat Spreader / Silicon Die Cap ──
    const capSize = 0.82;
    const capGeo = new THREE.BoxGeometry(capSize, capSize, 0.035);
    const cap = new THREE.Mesh(capGeo, this.capMat);
    cap.position.set(0, 0, chipThickness / 2 + 0.018);
    this.chipBody.add(cap);

    // ── 4. Delicate Rose-Copper Bond Pads & Traces ──
    const spacing = 1.1 / (this.pinsPerSide - 1);
    const pinGeo = new THREE.BoxGeometry(0.035, 0.2, 0.02);
    const padGeo = new THREE.BoxGeometry(0.055, 0.1, 0.015);
    const traceMat = new THREE.LineBasicMaterial({ color: 0xc27852, transparent: true, opacity: 0.7 });

    for (let i = 0; i < this.pinsPerSide; i++) {
      const offset = -0.55 + i * spacing;

      // North
      const pinN = new THREE.Mesh(pinGeo, this.copperMat);
      pinN.position.set(offset, 0.86, 0.018);
      this.chipBody.add(pinN);

      const padN = new THREE.Mesh(padGeo, this.copperMat);
      padN.position.set(offset * 1.45, 1.25, 0.01);
      this.chipBody.add(padN);

      const ptsN = [new THREE.Vector3(offset, 0.96, 0.015), new THREE.Vector3(offset * 1.45, 1.2, 0.015)];
      this.chipBody.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsN), traceMat));
      this.tracePoints.push({ start: ptsN[0], end: ptsN[1] });

      // South
      const pinS = new THREE.Mesh(pinGeo, this.copperMat);
      pinS.position.set(offset, -0.86, 0.018);
      this.chipBody.add(pinS);

      const padS = new THREE.Mesh(padGeo, this.copperMat);
      padS.position.set(offset * 1.45, -1.25, 0.01);
      this.chipBody.add(padS);

      const ptsS = [new THREE.Vector3(offset, -0.96, 0.015), new THREE.Vector3(offset * 1.45, -1.2, 0.015)];
      this.chipBody.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsS), traceMat));
      this.tracePoints.push({ start: ptsS[0], end: ptsS[1] });

      // East
      const pinE = new THREE.Mesh(pinGeo, this.copperMat);
      pinE.rotation.z = Math.PI / 2;
      pinE.position.set(0.86, offset, 0.018);
      this.chipBody.add(pinE);

      const padE = new THREE.Mesh(padGeo, this.copperMat);
      padE.rotation.z = Math.PI / 2;
      padE.position.set(1.25, offset * 1.45, 0.01);
      this.chipBody.add(padE);

      const ptsE = [new THREE.Vector3(0.96, offset, 0.015), new THREE.Vector3(1.2, offset * 1.45, 0.015)];
      this.chipBody.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsE), traceMat));
      this.tracePoints.push({ start: ptsE[0], end: ptsE[1] });

      // West
      const pinW = new THREE.Mesh(pinGeo, this.copperMat);
      pinW.rotation.z = Math.PI / 2;
      pinW.position.set(-0.86, offset, 0.018);
      this.chipBody.add(pinW);

      const padW = new THREE.Mesh(padGeo, this.copperMat);
      padW.rotation.z = Math.PI / 2;
      padW.position.set(-1.25, offset * 1.45, 0.01);
      this.chipBody.add(padW);

      const ptsW = [new THREE.Vector3(-0.96, offset, 0.015), new THREE.Vector3(-1.2, offset * 1.45, 0.015)];
      this.chipBody.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsW), traceMat));
      this.tracePoints.push({ start: ptsW[0], end: ptsW[1] });
    }

    // ── 5. Soft Studio Floor Shadow ──
    const shadowGeo = new THREE.PlaneGeometry(4.8, 4.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.16)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.05)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.42;
    this.group.add(shadow);
  }

  buildCircuitPulses() {
    // 6 animated glowing pulse photons traveling along the traces
    const photonGeo = new THREE.SphereGeometry(0.022, 8, 8);
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(photonGeo, this.pulseMat);
      this.chipBody.add(mesh);
      this.pulseParticles.push({
        mesh: mesh,
        traceIndex: Math.floor(Math.random() * this.tracePoints.length),
        t: Math.random(),
        speed: 0.6 + Math.random() * 0.8
      });
    }
  }

  update(delta, time) {
    // Animate glowing circuit energy pulses along traces
    for (let p of this.pulseParticles) {
      p.t += delta * p.speed;
      if (p.t > 1.0) {
        p.t = 0;
        p.traceIndex = Math.floor(Math.random() * this.tracePoints.length);
        p.speed = 0.6 + Math.random() * 0.8;
      }

      const trace = this.tracePoints[p.traceIndex];
      if (trace) {
        p.mesh.position.lerpVectors(trace.start, trace.end, p.t);
        const pulseAlpha = Math.sin(p.t * Math.PI);
        p.mesh.scale.setScalar(0.8 + pulseAlpha * 0.6);
      }
    }
  }
}
