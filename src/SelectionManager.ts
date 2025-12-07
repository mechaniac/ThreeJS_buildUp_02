// SelectionManager.ts
import * as THREE from "three";

export class SelectionManager {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private selectables: THREE.Object3D[] = [];

  constructor(
    private camera: THREE.Camera,
    private domElement: HTMLElement,
    private onSelect: (obj: THREE.Object3D | null) => void
  ) {
    this.domElement.addEventListener("pointerdown", this.onPointerDown);
  }

  setSelectables(objs: THREE.Object3D[]) {
    this.selectables = objs;
  }

  dispose() {
    this.domElement.removeEventListener("pointerdown", this.onPointerDown);
  }

  private onPointerDown = (ev: PointerEvent) => {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hits = this.raycaster.intersectObjects(this.selectables, false);
    if (hits.length === 0) {
      this.onSelect(null);
      return;
    }

    this.onSelect(hits[0].object);
  };
}
