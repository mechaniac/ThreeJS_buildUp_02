// src/geometry/curves/editableClosedCurve.ts
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export type CurveSelectionMode = 'curve' | 'vertex';

export interface EditableClosedCurve {
  group: THREE.Group;                 // add this to the scene
  setMode(mode: CurveSelectionMode): void;
  getMode(): CurveSelectionMode;
  dispose(): void;                    // remove listeners if needed
}

export function createEditableClosedCurve(
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera,
  gizmo: TransformControls & THREE.Object3D,
  segments = 8,
  radius = 1.0
): EditableClosedCurve {
  const group = new THREE.Group();

  // --- control vertices (handles)
  const controlMeshes: THREE.Mesh[] = [];
  const controlPoints: THREE.Vector3[] = [];

  const handleGeom = new THREE.BoxGeometry(.05, .05, .05);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffcc55 });

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = 0;

    const pos = new THREE.Vector3(x, y, z);
    controlPoints.push(pos);

    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.copy(pos);
    group.add(handle);
    controlMeshes.push(handle);
  }

  // --- closed Catmull-Rom curve
  const curve = new THREE.CatmullRomCurve3(controlPoints, true);

  const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffcc });
  const curveGeometry = new THREE.BufferGeometry();
  curveGeometry.setFromPoints(curve.getPoints(64));

  const curveLine = new THREE.Line(curveGeometry, curveMaterial);
  group.add(curveLine);

  // helper: update curve shape from handle positions
  function updateCurveFromHandles() {
    for (let i = 0; i < controlMeshes.length; i++) {
      curve.points[i].copy(controlMeshes[i].position);
    }
    const pts = curve.getPoints(64);
    curveLine.geometry.setFromPoints(pts);
  }

  // --- selection mode + active handle
  let selectionMode: CurveSelectionMode = 'curve';
  let activeHandle: THREE.Mesh | null = null;

  function setHandlesVisible(visible: boolean) {
    for (const h of controlMeshes) {
      h.visible = visible;
    }
  }

  // gizmo change: whenever something moves, refresh curve
  const onGizmoChange = () => {
    updateCurveFromHandles();
  };
  gizmo.addEventListener('change', onGizmoChange);

  // --- raycasting to pick handles in vertex mode
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  const onPointerDown = (event: PointerEvent) => {
    if (selectionMode !== 'vertex') return;

    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(controlMeshes, false);
    if (hits.length === 0) {
      // clicked gizmo / empty space / other stuff -> keep current selection
      return;
    }

    const hitObject = hits[0]!.object as THREE.Mesh;
    activeHandle = hitObject;
    gizmo.attach(activeHandle);
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  function setMode(mode: CurveSelectionMode) {
    selectionMode = mode;

    if (mode === 'curve') {
      activeHandle = null;
      setHandlesVisible(false);
      gizmo.attach(group);     // move whole curve
    } else {
      setHandlesVisible(true);
      // gizmo will attach to a handle on click
      if (activeHandle) {
        gizmo.attach(activeHandle);
      } else {
        gizmo.attach(group);   // until a handle is picked
      }
    }
  }

  // initial state
  setMode('curve');
  updateCurveFromHandles();

  return {
    group,
    setMode,
    getMode() {
      return selectionMode;
    },
    dispose() {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      gizmo.removeEventListener('change', onGizmoChange);
      curveLine.geometry.dispose();
      curveMaterial.dispose();
      handleGeom.dispose();
      handleMat.dispose();
    },
  };
}
