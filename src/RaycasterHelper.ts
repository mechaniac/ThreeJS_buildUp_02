// src/RaycasterHelper.ts
import * as THREE from "three";

export class RaycasterHelper {
    private raycaster = new THREE.Raycaster();
    
    constructor(private camera: THREE.Camera) { }

    castFromPointer(
        ev: PointerEvent,
        domElement: HTMLElement,
        objects: THREE.Object3D[]
    ): THREE.Intersection[] {
        const rect = domElement.getBoundingClientRect();
        const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        return this.raycaster.intersectObjects(objects, true);
    }
}
