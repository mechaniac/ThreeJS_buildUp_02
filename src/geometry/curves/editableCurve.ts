import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/Addons.js';

export type CurveEditMode = 'curve' | 'vertex';

export interface EditableCurve {
  group: THREE.Group;                           // root object in scene
  line: THREE.Line;                             // visible curve line
  getMode(): CurveEditMode;
  setMode(mode: CurveEditMode): void;
  tryPickVertex(raycaster: THREE.Raycaster): boolean; // try select a CV, return true if hit
  onGizmoChanged(): void;                       // called when gizmo fires 'change'
}

export function createEditableCurve(
  camera: THREE.Camera,
  gizmo: TransformControls & THREE.Object3D,
  segments = 8,
  radius = 1.0,
  color = 0x00ffcc
): EditableCurve {
  const group = new THREE.Group();

  // --- control points (math)
  const controlPoints: THREE.Vector3[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = 0;
    controlPoints.push(new THREE.Vector3(x, y, z));
  }

  // --- Catmull-Rom spline
  const curve = new THREE.CatmullRomCurve3(controlPoints, true);

  // --- line geometry from curve samples
  const curveGeometry = new THREE.BufferGeometry().setFromPoints(
    curve.getPoints(64)
  );
  const curveMaterial = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(curveGeometry, curveMaterial);
  group.add(line);

  // --- control vertex handles (cubes)
  const controlMeshes: THREE.Mesh[] = [];
  const handleGeom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffcc55 });

  for (const p of controlPoints) {
    const m = new THREE.Mesh(handleGeom, handleMat);
    m.position.copy(p);
    m.visible = false; // only visible in vertex mode
    group.add(m);
    controlMeshes.push(m);
  }

  // helper: sync curve from handles and resample line
  function updateCurveFromHandles() {
    for (let i = 0; i < controlMeshes.length; i++) {
      curve.points[i].copy(controlMeshes[i].position);
    }
    const pts = curve.getPoints(64);
    curveGeometry.setFromPoints(pts);
  }

  function setHandlesVisible(visible: boolean) {
    for (const h of controlMeshes) h.visible = visible;
  }

  let mode: CurveEditMode = 'curve';
  let activeIndex: number | null = null;

  function getMode(): CurveEditMode {
    return mode;
  }

  function setMode(newMode: CurveEditMode): void {
    mode = newMode;

    if (mode === 'curve') {
      activeIndex = null;
      setHandlesVisible(false);
      // move whole curve in this mode
      gizmo.attach(group);
    } else {
      // vertex mode
      setHandlesVisible(true);
      // until a vertex is picked, gizmo stays on group
      gizmo.attach(group);
    }
  }

  // Try picking a vertex; returns true if a handle was hit
  function tryPickVertex(raycaster: THREE.Raycaster): boolean {
    if (mode !== 'vertex') return false;

    const hits = raycaster.intersectObjects(controlMeshes, false);
    if (hits.length === 0) return false;

    const hitObj = hits[0].object as THREE.Mesh;
    const idx = controlMeshes.indexOf(hitObj);
    if (idx === -1) return false;

    activeIndex = idx;
    gizmo.attach(controlMeshes[idx]); // move this CV with gizmo now
    return true;
  }

  // Called when gizmo changes transform
  function onGizmoChanged(): void {
    // If a handle is attached, its position changed in local space
    // so we rebuild the curve from handle positions
    updateCurveFromHandles();
  }

  // initial state
  setMode('curve');
  updateCurveFromHandles();

  return {
    group,
    line,
    getMode,
    setMode,
    tryPickVertex,
    onGizmoChanged,
  };
}
