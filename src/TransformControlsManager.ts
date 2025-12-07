// TransformControlsManager.ts
import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class TransformControlsManager {
  readonly controls: TransformControls;

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    private orbit: OrbitControls
  ) {
    this.controls = new TransformControls(camera, domElement);
    this.controls.setMode("translate");
    this.controls.setSpace("local");

    this.controls.addEventListener("dragging-changed", (e: any) => {
      this.orbit.enabled = !e.value;
    });

    window.addEventListener("keydown", this.onKeyDown);
  }

  getHelper(): THREE.Object3D {
    return this.controls.getHelper();
  }

  attach(obj: THREE.Object3D) {
    this.controls.attach(obj);
  }

  dispose() {
    this.controls.dispose();
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "w":
        this.controls.setMode("translate");
        break;
      case "e":
        this.controls.setMode("rotate");
        break;
      case "r":
        this.controls.setMode("scale");
        break;
      case "1":
        this.controls.setSpace("world");
        break;
      case "2":
        this.controls.setSpace("local");
        break;
    }
  };
}
