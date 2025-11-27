import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createGround } from './objects/ground.js';
import { createSphere } from './objects/sphere.js';
import { addOrbitControls } from './controls/orbit.js';
import { addTransformControls } from './controls/transform.js';
import { createTransformPanel } from './ui/transformPanel.js';

// --- DOM references
const canvas = document.getElementById('scene') as HTMLCanvasElement;

// --- renderer / scene / camera
const renderer = createRenderer(canvas);
const scene = createScene();
const camera = createCamera();

resizeRenderer(); // whatever you already had

// --- objects
const ground = createGround();
scene.add(ground);

const sphere = createSphere();
scene.add(sphere);

// --- controls
const orbit = addOrbitControls(camera, renderer.domElement);
const tControls = addTransformControls(camera, renderer.domElement, sphere);
scene.add(tControls as unknown as THREE.Object3D);

tControls.addEventListener('dragging-changed', (event: any) => {
  orbit.enabled = !event.value;
});

// --- UI panel
const transformPanel = createTransformPanel(sphere);

// --- resize to fit the viewport div

function resizeRenderer() {
  const viewport = document.getElementById('viewport') as HTMLDivElement;
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;

  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// update UI whenever the gizmo moves the sphere
tControls.addEventListener('change', () => {
  transformPanel.updateFromTarget();
});

// also initialise once
transformPanel.updateFromTarget();

// --- main loop
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();
