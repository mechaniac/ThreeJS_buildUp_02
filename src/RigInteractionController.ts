// RigInteractionController.ts
import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { Joint } from "./Joint.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";


export class RigInteractionController {
    private raycaster = new THREE.Raycaster();
    private pointer = new THREE.Vector2();
    private transformControls: TransformControls;
    private helper: THREE.Object3D;

    private pickableMeshes: THREE.Object3D[] = [];
    private selectedJoint: Joint | null = null;

    constructor(
        private camera: THREE.Camera,
        private scene: THREE.Scene,
        private domElement: HTMLElement,
        joints: Joint[],
        private orbit: OrbitControls
    ) {
        this.transformControls = new TransformControls(camera, domElement);
        this.transformControls.setMode('translate');
        this.transformControls.size = 0.5;

        // NEW: get the helper Object3D and add that to the scene
        this.helper = this.transformControls.getHelper();
        this.scene.add(this.helper);

        // collect meshes to raycast against
        this.pickableMeshes = joints.map(j => j.sphere);

        domElement.addEventListener('pointerdown', this.onPointerDown);


        this.transformControls.addEventListener("dragging-changed", (e: any) => {
            // you can wire this to OrbitControls.enabled if you want
            orbit.enabled = !e.value;
        });
    }

    dispose() {
        this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        this.scene.remove(this.helper);
        this.transformControls.dispose();
    }

    private onPointerDown = (event: PointerEvent) => {
        const rect = this.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const hits = this.raycaster.intersectObjects(this.pickableMeshes, false);
        if (hits.length === 0) {
            // this.setSelectedJoint(null);
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
