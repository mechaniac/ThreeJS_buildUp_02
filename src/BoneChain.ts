import * as THREE from "three";
import { BoneChainType } from './BoneChainClass';

export function createBoneChain(count: number, spacing: number): BoneChainType {
    const bones: THREE.Bone[] = [];

    for (let i = 0; i < count; i++) {
        const bone = new THREE.Bone();
        bone.name = `Bone_${i}`;
        bone.userData.index = i;

        // add clickable sphere handle
        const geo = new THREE.SphereGeometry(0.05, 12, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const handle = new THREE.Mesh(geo, mat);

        handle.userData.isHandle = true;
        handle.userData.bone = bone;

        bone.add(handle);

        if (i > 0) {
            bones[i - 1].add(bone);
            bone.position.y = spacing;
        }

        bones.push(bone);
    }

    return {
        root: bones[0],
        bones,
        handles: bones.map(b => b.children[0] as THREE.Mesh)
    };
}
