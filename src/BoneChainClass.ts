// BoneChainClass.ts
import * as THREE from "three";

export class BoneChain {
  readonly bones: THREE.Bone[] = [];
  readonly root: THREE.Bone;
  readonly handles: THREE.Mesh[] = [];

  private _vParentWorld = new THREE.Vector3();
  private _vChildWorld = new THREE.Vector3();
  private _childLocal = new THREE.Vector3();
  private _upLocal = new THREE.Vector3(0, 1, 0);
  private _quat = new THREE.Quaternion();

  constructor(count: number, spacing: number) {
    const geo = new THREE.ConeGeometry(
      0.06, // radius
      1.0,  // height = 1 unit
      4     // segments
    );
    geo.translate(0, 0.5, 0);

    for (let i = 0; i < count; i++) {
      const bone = new THREE.Bone();
      bone.name = `Bone_${i}`;
      bone.userData.index = i;

      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const handle = new THREE.Mesh(geo, mat);

      handle.userData.isHandle = true;
      handle.userData.bone = bone;
      bone.userData.handle = handle;       // <--- important

      bone.add(handle);
      this.handles.push(handle);

      if (i > 0) {
        this.bones[i - 1].add(bone);
        bone.position.y = spacing;
      }

      this.bones.push(bone);
    }

    this.root = this.bones[0];
    this.updateAllSegments();
  }

  /** run an initial adjustment for all parent bones */
  updateAllSegments() {
    // make sure world matrices are up to date
    this.root.updateWorldMatrix(true, true);

    for (const b of this.bones) {
      this.updateSegmentForParent(b);
    }
  }

  /** recompute handle attached to `parentBone`, based on its first child bone */
  updateSegmentForParent(parentBone: THREE.Bone) {
    // find first child bone
    const childBone = parentBone.children.find(
      c => (c as THREE.Bone).isBone
    ) as THREE.Bone | undefined;

    if (!childBone) return;

    // matrices up-to-date
    parentBone.updateWorldMatrix(true, false);
    childBone.updateWorldMatrix(true, false);

    // world positions
    parentBone.getWorldPosition(this._vParentWorld);
    childBone.getWorldPosition(this._vChildWorld);

    // child in parent's local space
    this._childLocal.copy(this._vChildWorld);
    parentBone.worldToLocal(this._childLocal);

    const length = this._childLocal.length();
    if (length === 0) return;

    const dirLocal = this._childLocal.clone().normalize();

    // rotate from +Y to dirLocal
    this._quat.setFromUnitVectors(this._upLocal, dirLocal);

    const handle = parentBone.userData.handle as THREE.Mesh;
    if (!handle) return;

    // base at parent origin
    handle.position.set(0, 0, 0);
    handle.quaternion.copy(this._quat);

    // stretch to full length
    handle.scale.set(1, length, 1);
  }

}
