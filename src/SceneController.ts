// src/SceneController.ts
import * as THREE from "three";
import { Entity } from "./Entity.js";

export class SceneController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private animationId: number | null = null;
  private lastTime = 0;

  private entities: Entity[] = [];

  constructor(private container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  start() {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.animate);
  }

  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.renderer.dispose();
  }

  /** entity API */
  addEntity(e: Entity) {
    this.entities.push(e);
    this.scene.add(e.object3D);
  }

  removeEntity(e: Entity) {
    this.entities = this.entities.filter(x => x !== e);
    this.scene.remove(e.object3D);
  }

  add(obj: THREE.Object3D) {
    this.scene.add(obj);
  }

  remove(obj: THREE.Object3D) {
    this.scene.remove(obj);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  private animate = (time: number) => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // update all entities
    for (const e of this.entities) {
      e.update?.(dt);
    }

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };
}
