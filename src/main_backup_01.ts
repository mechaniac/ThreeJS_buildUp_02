//main.ts

import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { addOrbitControls } from './controls/orbit.js';
import { addGizmo } from './controls/transform.js';
import { createResizeHandler } from './core/resize.js';
import {
  createEditableCurve,
  type EditableCurve,
} from './geometry/curves/editableCurve.js';

// --- DOM + core
const canvas = document.getElementById('scene') as HTMLCanvasElement;
const renderer = createRenderer(canvas);
const scene = createScene();
const camera = createCamera();

// resize to fit #viewport container
createResizeHandler(renderer, camera, 'viewport');

// lights
const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(3, 5, 2);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// orbit controls
const orbit = addOrbitControls(camera, renderer.domElement);

// transform gizmo
const gizmo = addGizmo(camera, renderer.domElement, new THREE.Object3D());
scene.add(gizmo as unknown as THREE.Object3D);

// keep orbit fixed while dragging
gizmo.addEventListener('dragging-changed', (event: any) => {
  orbit.enabled = !event.value;
});

// --- create several editable curves
const curves: EditableCurve[] = [];

// curve 0
const curveA = createEditableCurve(camera, gizmo, 8, 1.0, 0x00ffcc, "curveA");
curveA.group.position.set(-1.5, 0, 0);
scene.add(curveA.group);
curves.push(curveA);
// curveA.logCurve();

// curve 1
const curveB = createEditableCurve(camera, gizmo, 8, 0.6, 0xff6699);
curveB.group.position.set(1.5, 0, 0);
scene.add(curveB.group);
curves.push(curveB);

// active curve: start with A
let activeCurve: EditableCurve | null = curveA;
activeCurve.setMode('curve');
gizmo.attach(curveA.group);

// --- central pointer handler

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// make line picking easier
raycaster.params.Line.threshold = 0.1;

function updatePointer(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);

  // -----------------------------------------
  // 1) VERTEX PICK (only on active curve, only in vertex mode)
  // -----------------------------------------
  if (activeCurve && activeCurve.getMode() === 'vertex') {
    const hitVertex = activeCurve.tryPickVertex(raycaster);
    // IMPORTANT:
    // In vertex mode we *do not* fall through to curve selection.
    // That way clicking on gizmo axes doesn't reattach to the group.
    if (hitVertex) return;
    return;//because we are in vertex mode, we ALWAYS return (might be redundant)
  }

  // -----------------------------------------
  // 2) CURVE PICK (same as before, works in curve mode)
  // -----------------------------------------
  const lines = curves.map((c) => c.line);
  const hits = raycaster.intersectObjects(lines, true);

  if (hits.length === 0) {
    // clicked empty space → keep current activeCurve
    return;
  }

  const hitObj = hits[0].object;

  const hitCurve = curves.find((curve) => {
    let obj: THREE.Object3D | null = hitObj;
    while (obj) {
      if (obj === curve.group) return true;
      obj = obj.parent;
    }
    return false;
  });

  if (!hitCurve) return;

  activeCurve = hitCurve;
  // attach gizmo according to current mode of activeCurve
  if (activeCurve.getMode() === 'curve') {
    gizmo.attach(activeCurve.group);
  } else {
    // vertex mode with no vertex picked yet -> gizmo on group
    gizmo.attach(activeCurve.group);
  }

  console.log('Selected curve:', activeCurve.group.uuid);
});

// --- gizmo change: update active curve's shape
gizmo.addEventListener('change', () => {
  if (activeCurve) {
    activeCurve.onGizmoChanged();
  }
});

// --- keyboard: change mode on active curve
window.addEventListener('keydown', (event) => {
  if (!activeCurve) return;

  switch (event.key) {
    case '1': {
      activeCurve.setMode('curve');
      gizmo.attach(activeCurve.group);
      console.log('Mode curve on', activeCurve.group.uuid);
      break;
    }
    case '2': {
      activeCurve.setMode('vertex');
      // gizmo will move to a vertex when we click one
      gizmo.attach(activeCurve.group);
      console.log('Mode vertex on', activeCurve.group.uuid);
      break;
    }
  }
});

// --- main loop
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();
