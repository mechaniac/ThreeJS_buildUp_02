// src/controls/transform.ts
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import type * as THREE from 'three';

export function addGizmo(
  camera: THREE.Camera,
  domElement: HTMLElement,
  object: THREE.Object3D
): TransformControls & THREE.Object3D {
  const gizmo = new TransformControls(camera, domElement) as TransformControls & THREE.Object3D;
  gizmo.setMode('translate');
  gizmo.attach(object);
  return gizmo;
}
