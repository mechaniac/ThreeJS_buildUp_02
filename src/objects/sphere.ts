import * as THREE from 'three';

export function createSphere(radius = 1): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 32, 16);
  const material = new THREE.MeshNormalMaterial();
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 1, 0);
  return sphere;
}
