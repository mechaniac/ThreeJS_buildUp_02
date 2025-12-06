// src/App.ts
import * as THREE from "three";
import { SceneController } from "./SceneController.js";
import { CubeEntity } from "./CubeEntity.js";    // if you use it
import { RaycasterHelper } from "./RaycasterHelper.js";

export class App {
  private sceneController: SceneController;
  private cubeEntity: CubeEntity;
  private c2: CubeEntity;
  private rayHelper: RaycasterHelper;

  private selectable: THREE.Object3D[] = [];
  private selected: THREE.Object3D | null = null;
  private canvas:HTMLElement;

  constructor(private container: HTMLElement) {
    this.sceneController = new SceneController(container);

    this.cubeEntity = new CubeEntity(1, 0xff0000);
    this.sceneController.addEntity(this.cubeEntity);

    this.c2 = new CubeEntity(1, 0xffffff);
    this.sceneController.addEntity(this.c2);
    this.c2.object3D.position.x +=3;
    this.c2.setSpeed(-.1);

    const axes = new THREE.AxesHelper(2);
    this.sceneController.add(axes);

    // set up raycaster
    this.rayHelper = new RaycasterHelper(this.sceneController.getCamera());
    this.selectable.push(this.cubeEntity.object3D);
    this.selectable.push(this.c2.object3D);

    this.canvas = this.sceneController.getDomElement();
    this.canvas.addEventListener("pointerdown", this.onPointerDown);

    window.addEventListener("resize", this.onResize);
    this.sceneController.start();
  }

  private onPointerDown = (ev: PointerEvent) => {
    // const canvas = this.sceneController.getDomElement();
    const hits = this.rayHelper.castFromPointer(ev, this.canvas, this.selectable);
    if (!hits.length) {
      this.setSelected(null);
      return;
    }

    const obj = hits[0].object;
    this.setSelected(obj);
  };

  private setSelected(obj: THREE.Object3D | null) {
    // reset previous
    if (this.selected) {
      this.selected.scale.set(1, 1, 1);
    }

    this.selected = obj;

    if (this.selected) {
      this.selected.scale.set(1.2, 1.2, 1.2); // simple visual feedback
      console.log("Selected:", this.selected);
    } else {
      console.log("Selection cleared");
    }
  }

  private onResize = () => {
    this.sceneController.resize();
  };

  dispose() {
    window.removeEventListener("resize", this.onResize);
    const canvas = this.sceneController.getDomElement();
    canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.sceneController.dispose();
  }

  spinCube(speed = 1) {
    this.cubeEntity.setSpeed(speed);
  }
}
