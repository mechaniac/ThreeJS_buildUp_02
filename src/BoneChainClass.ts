// BoneChainClass.ts
import * as THREE from "three";

export class BoneChain {
  readonly bones: THREE.Bone[] = [];
  readonly root: THREE.Bone;
  readonly handles: THREE.Mesh[] = [];

  private _vParentWorld = new THREE.Vector3();
  private _vChildWorld  = new THREE.Vector3();
  private _childLocal   = new THREE.Vector3();
  private _upLocal      = new THREE.Vector3(0, 1, 0);
  private _quat         = new THREE.Quaternion();

  constructor(count: number, spacing: number) {
    const geo = new THREE.ConeGeometry(0.06, spacing, 4); // pyramid-y
    geo.translate(0, spacing / 2, 0); // so base is at origin, tip up

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
  }

  /** recompute handle attached to `parentBone`, based on its first child bone */
  updateSegmentForParent(parentBone: THREE.Bone) {
    // find first child bone
    const childBone = parentBone.children.find(
      c => (c as THREE.Bone).isBone
    ) as THREE.Bone | undefined;

    if (!childBone) return; // no child => nothing to stretch towards

    // ensure matrices are up-to-date
    parentBone.updateWorldMatrix(true, false);
    childBone.updateWorldMatrix(true, false);

    parentBone.getWorldPosition(this._vParentWorld);
    childBone.getWorldPosition(this._vChildWorld);

    // child position in parent's local space
    this._childLocal.copy(this._vChildWorld);
    parentBone.worldToLocal(this._childLocal);

    const length = this._childLocal.length();
    if (length === 0) return;

    const dirLocal = this._childLocal.clone().normalize();

    const quat = this._quat.setFromUnitVectors(this._upLocal, dirLocal);

    const handle = parentBone.userData.handle as THREE.Mesh;
    if (!handle) return;

    // local midpoint between parent (0,0,0) and childLocal
    handle.position.copy(this._childLocal).multiplyScalar(0.5);
    handle.quaternion.copy(quat);

    // stretch along local Y
    handle.scale.set(1, length, 1);
  }
}
