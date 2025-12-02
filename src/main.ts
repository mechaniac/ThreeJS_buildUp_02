// src/main.ts
import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { addOrbitControls } from './controls/orbit.js';
import { addGizmo } from './controls/transform.js';
import { createResizeHandler } from './core/resize.js';
import {
  createEditableClosedCurve,
  type CurveSelectionMode,
} from './geometry/curves/editableClosedCurve.js';

// --- DOM + core
const canvas = document.getElementById('scene') as HTMLCanvasElement;
const renderer = createRenderer(canvas);
const scene = createScene();
const camera = createCamera();

// resize to fit #viewport
const disposeResize = createResizeHandler(renderer, camera, 'viewport');

// lights
const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(3, 5, 2);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// camera controls
const orbit = addOrbitControls(camera, renderer.domElement);

// transform gizmo
const gizmo = addGizmo(camera, renderer.domElement, new THREE.Object3D());
scene.add(gizmo as unknown as THREE.Object3D);

// keep orbit fixed while dragging
gizmo.addEventListener('dragging-changed', (event: any) => {
  orbit.enabled = !event.value;
});

// editable curve
const editableCurve = createEditableClosedCurve(renderer, camera, gizmo, 8, 1.0);
scene.add(editableCurve.group);
for (const child of editableCurve.group.children) {
  console.log(child); // Logs the entire THREE.Mesh object instance
  console.log('Object Type:', child.type); // e.g., 'Mesh'
  console.log('Object UUID:', child.uuid); // A unique identifier
  console.log('Object Position:', child.position.toArray()); // Position data
}

// keyboard: 1 = curve mode, 2 = vertex mode
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case '1':
      editableCurve.setMode('curve');
      console.log('Selection mode: CURVE');
      break;
    case '2':
      editableCurve.setMode('vertex');
      console.log('Selection mode: VERTEX');
      break;
  }
});

// main loop
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();

// later, if you need teardown/hot reload, you can call:
// editableCurve.dispose();
// disposeResize();
