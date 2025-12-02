import * as THREE from 'three';

export interface SelectableCurve {
  group: THREE.Group;   // the root object you add to the scene
  line: THREE.Line;     // the visible curve line
}

export function createSelectableCurve(
  segments = 8,
  radius = 1.0,
  color = 0x00ffcc
): SelectableCurve {
  const group = new THREE.Group();

  // --- build a closed circle of control points
  const controlPoints: THREE.Vector3[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = 0;
    controlPoints.push(new THREE.Vector3(x, y, z));
  }

  // --- smooth closed Catmull-Rom curve
  const curve = new THREE.CatmullRomCurve3(controlPoints, true);
  const samples = curve.getPoints(64); // 64 segments -> smooth enough

  const geometry = new THREE.BufferGeometry().setFromPoints(samples);
  const material = new THREE.LineBasicMaterial({ color });

  const line = new THREE.Line(geometry, material);
  group.add(line);

  return {
    group,
    line,
  };
}
