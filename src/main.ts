// src/main.ts
import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { addOrbitControls } from './controls/orbit.js';
import { addGizmo } from './controls/transform.js';
import { createResizeHandler } from './core/resize.js';
import {
  createSelectableCurve,
  type SelectableCurve,
} from './geometry/curves/selectableCurve.js';

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

// --- create several selectable curves
const curves: SelectableCurve[] = [];

// curve 0
const curveA = createSelectableCurve(8, 1.0, 0x00ffcc);
curveA.group.position.set(-1.5, 0, 0);
scene.add(curveA.group);
curves.push(curveA);

// curve 1
const curveB = createSelectableCurve(8, 0.6, 0xff6699);
curveB.group.position.set(1.5, 0, 0);
scene.add(curveB.group);
curves.push(curveB);

// active curve: start with A
let activeCurve: SelectableCurve | null = curveA;
gizmo.attach(curveA.group);

// --- central pointer handler (curve selection only)

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// make line picking a bit easier
raycaster.params.Line.threshold = 0.1;

function updatePointer(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);

  // raycast against all curve groups (lines are children)
  const groups = curves.map((c) => c.group);
  const hits = raycaster.intersectObjects(groups, true);

  if (hits.length === 0) {
    // clicked empty space: keep current activeCurve
    return;
  }

  const hitObj = hits[0].object;

  // find which curve's group is an ancestor of the hit object
  const hitCurve = curves.find((curve) => {
    let obj: THREE.Object3D | null = hitObj;
    while (obj) {
      if (obj === curve.group) return true;
      obj = obj.parent;
    }
    return false;
  });

  if (!hitCurve) return;

  // switch active curve and attach gizmo to it
  activeCurve = hitCurve;
  gizmo.attach(activeCurve.group);

  console.log('Selected curve:', activeCurve.group.uuid);
});

// --- main loop
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();
