// src/App.ts
import * as THREE from "three";
import { SceneController } from "./SceneController.js";


export class App {
  private sceneController: SceneController;

  private selectable: THREE.Object3D[] = [];
  private selected: THREE.Object3D | null = null;
  private canvas:HTMLElement;

  constructor(private container: HTMLElement) {
    this.sceneController = new SceneController(container);

    const axes = new THREE.AxesHelper(2);
    this.sceneController.add(axes);



    this.canvas = this.sceneController.getDomElement();

    window.addEventListener("resize", this.onResize);
    this.sceneController.start();
  }


  private onResize = () => {
    this.sceneController.resize();
  };

  dispose() {
    window.removeEventListener("resize", this.onResize);
    const canvas = this.sceneController.getDomElement();
    this.sceneController.dispose();
  }

}
