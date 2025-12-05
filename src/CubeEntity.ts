import * as THREE from "three";
import { Entity } from "./Entity.js";

export class CubeEntity extends Entity {
  readonly object3D: THREE.Mesh;

  private rotationSpeed = 1; // radians per second

  constructor(size = 1, color = 0xff0000) {
    super();

    const geom = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshBasicMaterial({ color });
    this.object3D = new THREE.Mesh(geom, mat);
  }

  setSpeed(speed: number) {
    this.rotationSpeed = speed;
  }

  update(dt: number): void {
    this.object3D.rotation.y += this.rotationSpeed * dt;
  }
}
