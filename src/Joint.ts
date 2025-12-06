// Joint.ts
import * as THREE from 'three';

export class Joint extends THREE.Object3D {
  public readonly sphere: THREE.Mesh;
  public readonly index: number;

  constructor(index: number, radius = 0.05) {
    super();
    this.index = index;

    const geo = new THREE.SphereGeometry(radius, 12, 10);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sphere = new THREE.Mesh(geo, mat);

    // mark for picking
    this.sphere.userData.isJoint = true;
    this.sphere.userData.joint = this;

    this.add(this.sphere);
  }

  setSelected(selected: boolean) {
    const mat = this.sphere.material as THREE.MeshBasicMaterial;
    mat.color.set(selected ? 0xffaa00 : 0xffffff);
  }
}
