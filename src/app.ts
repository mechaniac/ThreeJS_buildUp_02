import * as THREE from "three";
import { SceneController } from "./SceneController.js";
import { CubeEntity } from "./CubeEntity.js";

export class App {
  private sceneController: SceneController;
  private cubeEntity: CubeEntity;

  constructor(private container: HTMLElement) {
    this.sceneController = new SceneController(container);

    this.cubeEntity = new CubeEntity(1, 0xff0000);
    this.sceneController.addEntity(this.cubeEntity);

    const axes = new THREE.AxesHelper(2);
    this.sceneController.add(axes);

    window.addEventListener("resize", this.onResize);
    this.sceneController.start();
  }

  private onResize = () => {
    this.sceneController.resize();
  };

  dispose() {
    window.removeEventListener("resize", this.onResize);
    this.sceneController.dispose();
  }

  // console / UI control
  spinCube(speed = 1) {
    this.cubeEntity.setSpeed(speed);
  }
}
