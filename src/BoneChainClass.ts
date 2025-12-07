import * as THREE from 'three';


export interface BoneChainType {
    root: THREE.Bone,
    bones: THREE.Bone[],
    handles: THREE.Mesh[]

}

export class BoneChain implements BoneChainType {
    public readonly bones: THREE.Bone[] = [];
    public readonly root: THREE.Bone;
    public readonly handles: THREE.Mesh[] = [];

    constructor(count: number, private spacing: number) {
        const geo = new THREE.SphereGeometry(0.05, 12, 10);

        for (let i = 0; i < count; i++) {
            const bone = new THREE.Bone();
            bone.name = `Bone_${i}`;
            bone.userData.index = i;
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // add clickable sphere handle
            const handle = new THREE.Mesh(geo, mat);
            handle.userData.isHandle = true;
            handle.userData.bone = bone;
            this.handles.push(handle);
            bone.add(handle);

            if (i > 0) {
                this.bones[i - 1].add(bone);
                bone.position.y = spacing;
            }
            this.bones.push(bone);
        }
        this.root = this.bones[0];
    }
}