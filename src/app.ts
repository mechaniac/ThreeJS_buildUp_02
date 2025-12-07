// src/App.ts
import * as THREE from "three";
import { SceneController } from "./SceneController.js";


export class App {
  private sceneController: SceneController;

  private selectable: THREE.Object3D[] = [];
  private selected: THREE.Object3D | null = null;

  constructor(private container: HTMLElement) {
    this.sceneController = new SceneController(container);
  }

}
