import * as THREE from 'three';
import { RobotCompanion } from './character.js';
import { ChipPedestal } from './chipPedestal.js';

export class CleanroomChipScene {
  constructor(container) {
    this.container = container;
    this.width = container.offsetWidth || window.innerWidth;
    this.height = container.offsetHeight || window.innerHeight;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.rotation = { x: 0.35, y: -0.25 };
    this.targetRotation = { x: 0.35, y: -0.25 };

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.init();
    this.setupCleanroomLighting();
    this.buildSceneEntities();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();

    // Studio Perspective Camera
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
    this.updateCameraForViewport();

    // High performance WebGL renderer with antialiasing
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.domElement = this.renderer.domElement;
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';
    this.domElement.style.display = 'block';

    this.container.appendChild(this.domElement);
  }

  updateCameraForViewport() {
    const isMobile = this.width < 768;
    if (isMobile) {
      this.camera.position.set(0, 0.8, 8.2);
    } else {
      this.camera.position.set(0, 0.9, 6.6);
    }
  }

  setupCleanroomLighting() {
    // 1. Soft daylight cleanroom ambient light
    const ambient = new THREE.AmbientLight(0xf8fafc, 1.9);
    this.scene.add(ambient);

    // 2. Primary Key Light (Warm soft sunlight from top-right)
    const keyLight = new THREE.DirectionalLight(0xfffbf5, 2.6);
    keyLight.position.set(6, 10, 7);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // 3. Cool soft fill light from left (cleanroom sky blue-white)
    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.5);
    fillLight.position.set(-6, 4, 4);
    this.scene.add(fillLight);

    // 4. Subtle copper specular highlight light
    const copperSpecular = new THREE.PointLight(0xc27852, 1.8, 12);
    copperSpecular.position.set(2, 2, 4);
    this.scene.add(copperSpecular);

    // 5. Cyan bot rim light
    const botRim = new THREE.PointLight(0x38bdf8, 1.2, 8);
    botRim.position.set(2.5, 1.5, -1.0);
    this.scene.add(botRim);
  }

  buildSceneEntities() {
    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);

    // ── 1. Cleanroom Ceramic Microchip & Pedestal ──
    this.chip = new ChipPedestal();
    this.chipGroup = new THREE.Group();
    this.chipGroup.position.set(-1.25, -0.1, 0);
    this.chipGroup.rotation.x = 0.55;
    this.chipGroup.rotation.y = -0.45;
    this.chipGroup.add(this.chip.group);
    this.stageGroup.add(this.chipGroup);

    // ── 2. 3D Robotic Hardware Engineer Companion ──
    this.robot = new RobotCompanion();
    this.robotGroup = new THREE.Group();
    this.robotGroup.position.set(1.4, 0.1, 0.35);
    this.robotGroup.rotation.y = -0.35; // Angled slightly toward the chip
    this.robotGroup.add(this.robot.group);
    this.stageGroup.add(this.robotGroup);

    // Adjust layout for narrow screen devices
    this.adjustLayout();
  }

  adjustLayout() {
    const isMobile = this.width < 768;
    if (isMobile) {
      this.chipGroup.position.set(0, -0.85, 0);
      this.chipGroup.scale.setScalar(0.72);
      this.robotGroup.position.set(0, 1.1, 0);
      this.robotGroup.scale.setScalar(0.8);
      this.robotGroup.rotation.y = 0;
    } else {
      this.chipGroup.position.set(-1.25, -0.1, 0);
      this.chipGroup.scale.setScalar(0.92);
      this.robotGroup.position.set(1.4, 0.1, 0.35);
      this.robotGroup.scale.setScalar(0.92);
      this.robotGroup.rotation.y = -0.35;
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.width = this.container.offsetWidth || window.innerWidth;
      this.height = this.container.offsetHeight || window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.updateCameraForViewport();
      this.adjustLayout();
    });

    // Window mousemove for global character eye & head tracking
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Update robot look target
      if (this.robot) {
        this.robot.setLookTarget(normX, normY);
      }

      // Parallax for stage
      this.mouse.targetX = normX * 0.4;
      this.mouse.targetY = normY * 0.3;
    });

    // Drag-to-rotate interaction for chip stage
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.targetRotation.y += dx * 0.008;
      this.targetRotation.x += dy * 0.008;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Click on canvas to poke / spin the robot companion!
    this.container.addEventListener('click', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.robot.group.children, true);
      
      if (intersects.length > 0) {
        this.robot.triggerSpin();
      } else {
        // Also trigger wave or mild nod
        this.robot.triggerSpin();
      }
    });

    // Hook buttons to wave
    const ctaBtns = document.querySelectorAll('.btn-pill-view, .btn-action-primary, .oscilloscope-header');
    ctaBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => this.robot?.setWaving(true));
      btn.addEventListener('mouseleave', () => this.robot?.setWaving(false));
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    // Smooth inertia
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.08;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.08;

    // Update 3D Robot
    if (this.robot) {
      this.robot.update(delta, t);
    }

    // Update 3D Chip & Circuit Pulses
    if (this.chip) {
      this.chip.update(delta, t);
    }

    // Gentle cleanroom ambient float
    const ambientFloat = Math.sin(t * 1.6) * 0.035;
    this.chipGroup.position.y = (this.width < 768 ? -0.85 : -0.1) + ambientFloat;
    this.chipGroup.rotation.x = this.rotation.x - this.mouse.y * 0.2;
    this.chipGroup.rotation.y = this.rotation.y + this.mouse.x * 0.25;

    // Stage parallax
    this.stageGroup.position.x = this.mouse.x * 0.12;
    this.stageGroup.position.y = this.mouse.y * 0.1;

    this.renderer.render(this.scene, this.camera);
  }
}
