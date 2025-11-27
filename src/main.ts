import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createGround } from './objects/ground.js';
import { createSphere } from './objects/sphere.js';
import { addOrbitControls } from './controls/orbit.js';
import { addTransformControls } from './controls/transform.js';

// canvas + renderer
const canvas = document.getElementById('scene') as HTMLCanvasElement;
const renderer = createRenderer(canvas);

// scene + camera
const scene = createScene();
const camera = createCamera();

// initial size
resizeRenderer();

// lights
const key = new THREE.DirectionalLight(0xffffff, 1.0);
key.position.set(3, 5, 2);
scene.add(key);

const fill = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(fill);

// objects
const ground = createGround();
scene.add(ground);

const sphere = createSphere(1);
scene.add(sphere);

// controls
const orbit = addOrbitControls(camera, renderer.domElement);
const tControls = addTransformControls(camera, renderer.domElement, sphere);
scene.add(tControls);

// disable orbit while dragging
tControls.addEventListener('dragging-changed', (event: any) => {
  orbit.enabled = !event.value;
});

// resize handling
window.addEventListener('resize', () => {
  resizeRenderer();
});

function resizeRenderer() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// main loop
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();
