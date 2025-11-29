import * as THREE from 'three';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const l = new THREE.DirectionalLight(new THREE.Color("#FFFFFF"),3)
  scene.add(l);
  return scene;
}
