// RigInteractionController.ts
import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { Joint } from "./Joint.js";


export class RigInteractionController {
    private raycaster = new THREE.Raycaster();
    private pointer = new THREE.Vector2();
    private transformControls: TransformControls;

    private pickableMeshes: THREE.Object3D[] = [];
    private selectedJoint: Joint | null = null;

    constructor(
        private camera: THREE.Camera,
        private scene: THREE.Scene,
        private domElement: HTMLElement,
        joints: Joint[]
    ) {
        this.transformControls = new TransformControls(camera, domElement);

        // debug
        console.log(
            "TransformControls.prototype instanceof Object3D:",
            TransformControls.prototype instanceof THREE.Object3D
        );
        console.log(
            "instance instanceof Object3D:",
            this.transformControls instanceof THREE.Object3D
        );
        this.transformControls.setMode('rotate');
        this.transformControls.size = 0.5;
        const gizmo = (this.transformControls as any)._gizmo;
        if (gizmo) {
            this.scene.add(gizmo);
        } else {
            console.warn("TransformControls has no _gizmo field – check three version");
        }

        // collect meshes to raycast against
        this.pickableMeshes = joints.map(j => j.sphere);

        domElement.addEventListener('pointerdown', this.onPointerDown);
    }

    dispose() {
        this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        const gizmo = (this.transformControls as any)._gizmo;
        this.scene.remove(gizmo);
    }

    private onPointerDown = (event: PointerEvent) => {
        const rect = this.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const hits = this.raycaster.intersectObjects(this.pickableMeshes, false);
        if (hits.length === 0) {
            this.setSelectedJoint(null);
            return;
        }

        const hit = hits[0];
        const joint: Joint | undefined = hit.object.userData.joint;
        if (joint) {
            this.setSelectedJoint(joint);
        }
    };

    private setSelectedJoint(joint: Joint | null) {
        if (this.selectedJoint === joint) return;

        if (this.selectedJoint) {
            this.selectedJoint.setSelected(false);
            this.transformControls.detach();
        }

        this.selectedJoint = joint;

        if (joint) {
            joint.setSelected(true);
            this.transformControls.attach(joint);
        }
    }
}
