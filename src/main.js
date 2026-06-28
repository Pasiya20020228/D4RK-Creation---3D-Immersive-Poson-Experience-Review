import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createEnvironment } from './environment.js';
import { createThorana } from './thorana.js';
import { updateLightingPatterns } from './lightingPatterns.js';
import { setupInteractions } from './interaction.js';

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020208); // Dark night sky

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('app').appendChild(renderer.domElement);

// Global Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0xa0d8ff, 0.5); // Soft blue moonlight
moonLight.position.set(-50, 100, -20);
scene.add(moonLight);

// Add Environment (Mihintale & Particles)
const { particlesMesh, mihintaleGroup } = createEnvironment(scene);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 500; // Increased to allow zooming to the temple
controls.minDistance = 20;
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Prevent going too far below ground

// State for interactions
const thoranaState = { isPaused: false, currentPatternIndex: 0 };
const patternNames = ['chasing', 'flashing', 'fading', 'pulse', 'wave'];

// Synchronized Rotation States
const rotationStates = [
  { upper: 1, lower: 1 },   // Both Clockwise
  { upper: 1, lower: -1 },  // Opposing
  { upper: -1, lower: -1 }, // Both Counter
  { upper: -1, lower: 1 }   // Opposing inverted
];
let currentRotationStateIndex = 0;

// Setup Interactions (UI, Raycaster)
const interactionMgr = setupInteractions(camera, scene, thoranaState);

const clock = new THREE.Clock();
let lastSwitchInterval = 0;

// Initialize Async because Thorana needs to fetch image configs
async function initApp() {
  const { 
    lowerRotatingGroup, 
    upperRotatingGroup,
    lowerInstancedBulbs,
    upperInstancedBulbs,
    lowerBulbCount,
    upperBulbCount
  } = await createThorana(scene);

  function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    controls.update();

    if (!thoranaState.isPaused) {
      // Auto-switch pattern every 30 seconds
      const currentInterval = Math.floor(time / 30);
      if (currentInterval > lastSwitchInterval) {
        lastSwitchInterval = currentInterval;
        
        // Cycle pattern
        thoranaState.currentPatternIndex = (thoranaState.currentPatternIndex + 1) % patternNames.length;
        interactionMgr.updateUIPattern(thoranaState.currentPatternIndex);
        
        // Cycle rotation state beautifully synced with patterns
        currentRotationStateIndex = (currentRotationStateIndex + 1) % rotationStates.length;
      }

      // Rotate Thorana Parts independently
      const rotState = rotationStates[currentRotationStateIndex];
      upperRotatingGroup.rotation.y += 0.005 * rotState.upper;
      lowerRotatingGroup.rotation.y += 0.005 * rotState.lower;
    }

    // Animate Particles
    particlesMesh.rotation.y = time * 0.02;
    
    // Animate Mihintale light pulse
    if (mihintaleGroup) {
        const stupaLight = mihintaleGroup.children.find(c => c.isPointLight);
        if (stupaLight) {
            stupaLight.intensity = 500 + Math.sin(time * 2) * 100;
        }
    }

    // Update Dynamic Lighting Patterns for both groups
    const currentPattern = patternNames[thoranaState.currentPatternIndex];
    updateLightingPatterns(time, currentPattern, lowerInstancedBulbs, lowerBulbCount);
    updateLightingPatterns(time, currentPattern, upperInstancedBulbs, upperBulbCount);

    renderer.render(scene, camera);
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start Animation
  animate();
}

initApp();
