// RigInteractionController.ts
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Joint } from './Joint';

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
    this.transformControls.setMode('rotate');
    this.transformControls.size = 0.5;
    this.scene.add(this.transformControls as unknown as THREE.Object3D);

    // collect meshes to raycast against
    this.pickableMeshes = joints.map(j => j.sphere);

    domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.scene.remove(this.transformControls as unknown as THREE.Object3D);
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
