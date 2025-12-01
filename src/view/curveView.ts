// src/view/curveView.ts
import * as THREE from 'three';
import type { CurveModel, Vec3 } from '../math/curveModel.js';
import { sampleCurve, getControlPoints } from '../math/curveModel.js';

export interface CurveView {
  group: THREE.Group;                 // add this to scene
  line: THREE.Line;                   // visible spline
  controlMeshes: THREE.Mesh[];        // spheres for CVs (can be hidden)
  updateFromModel(): void;            // when model changes
  dispose(): void;
}

function vecToVector3(v: Vec3): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}

export function createCurveView(
  model: CurveModel,
  segmentsForRender = 64
): CurveView {
  const group = new THREE.Group();

  // --- control vertex handles (visible only in edit mode)
  const controlMeshes: THREE.Mesh[] = [];
  const handleGeom = new THREE.SphereGeometry(0.05, 16, 16);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffcc55 });

  const controlPoints = getControlPoints(model);
  for (const p of controlPoints) {
    const mesh = new THREE.Mesh(handleGeom, handleMat);
    mesh.position.copy(vecToVector3(p));
    group.add(mesh);
    controlMeshes.push(mesh);
  }

  // --- curve line geometry
  const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffcc });
  const curveGeometry = new THREE.BufferGeometry();

  const line = new THREE.Line(curveGeometry, curveMaterial);
  group.add(line);

  function updateFromModel() {
    // 1) positions of control meshes from model
    const cps = getControlPoints(model);
    for (let i = 0; i < controlMeshes.length; i++) {
      controlMeshes[i].position.set(cps[i].x, cps[i].y, cps[i].z);
    }

    // 2) sample curve and update line
    const sampled = sampleCurve(model, segmentsForRender);
    const pts = sampled.map(vecToVector3);
    curveGeometry.setFromPoints(pts);
  }

  // initialise once
  updateFromModel();

  return {
    group,
    line,
    controlMeshes,
    updateFromModel,
    dispose() {
      curveGeometry.dispose();
      curveMaterial.dispose();
      handleGeom.dispose();
      handleMat.dispose();
    },
  };
}
