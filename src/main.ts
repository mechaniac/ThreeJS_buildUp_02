import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createGround } from './objects/ground.js';
import { createSphere } from './objects/sphere.js';
import { addOrbitControls } from './controls/orbit.js';
import { addGizmo } from './controls/transform.js';
import { createUIPanel } from './ui/transformPanel.js';
import { createGizmoModePanel } from './ui/gizmoModePanel.js';
import type { GizmoMode } from './ui/gizmoModePanel.js';
import { createGizmoSpacePanel } from './ui/gizmoSpacePanel.js';
import type { GizmoSpace } from './ui/gizmoSpacePanel.js';
import { createResizeHandler } from './core/resize.js';


// --- DOM references
const canvas = document.getElementById('scene') as HTMLCanvasElement;

// --- renderer / scene / camera
const renderer = createRenderer(canvas);
const scene = createScene();
const camera = createCamera();

// --- resize handling (keeps canvas in sync with #viewport)
const disposeResize = createResizeHandler(renderer, camera, 'viewport');

// resizeRenderer(); // whatever you already had

// --- objects
const ground = createGround();
scene.add(ground);

const sphere = createSphere();
scene.add(sphere);

// --- controls
const orbit = addOrbitControls(camera, renderer.domElement);
const gizmo = addGizmo(camera, renderer.domElement, sphere);
scene.add(gizmo as unknown as THREE.Object3D);

gizmo.addEventListener('dragging-changed', (event: any) => {
  orbit.enabled = !event.value;
});
// --- UI: gizmo mode panel
const gizmoModePanel = createGizmoModePanel((mode: GizmoMode) => {
  gizmo.setMode(mode);
});

const gizmoSpacePanel = createGizmoSpacePanel((space: GizmoSpace) => {
  gizmo.setSpace(space);
});

// --- UI panel
const uiPanel = createUIPanel(sphere);

// --- resize to fit the viewport div

// function resizeRenderer() {
//   const viewport = document.getElementById('viewport') as HTMLDivElement;
//   const w = viewport.clientWidth;
//   const h = viewport.clientHeight;

//   renderer.setSize(w, h, false);
//   camera.aspect = w / h;
//   camera.updateProjectionMatrix();
// }

// window.addEventListener("resize",resizeRenderer);

// update UI whenever the gizmo moves the sphere
gizmo.addEventListener('change', () => {
  uiPanel.updateFromTarget();
});



// (optional) if you want: start in translate mode explicitly
gizmoModePanel.setButtonMode('translate');
gizmo.setMode('translate');
gizmoSpacePanel.setSpace('local');
gizmo.setSpace('local');

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      gizmo.setMode('translate');
      break;
    case 'e':
      gizmo.setMode('rotate');
      break;
    case 'r':
      gizmo.setMode('scale');
      break;
  }
});

// also initialise once
uiPanel.updateFromTarget();

// --- main loop
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();
