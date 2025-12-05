import * as THREE from "three";

export abstract class Entity {
  /** the root object to add to the scene */
  abstract readonly object3D: THREE.Object3D;

  /** optional per-frame update */
  update?(dt: number): void;
}
