// SceneController.ts
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { JointChain } from "./JointChain.js";
import { RigInteractionController } from "./RigInteractionController.js";


export class SceneController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private chain : JointChain;
  private rigInteraction: RigInteractionController;

  private animationId: number | null = null;

  constructor(private container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    this.chain = JointChain.createLinear(5, 0.25);
    this.scene.add(this.chain.root);

    

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

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 0, 0);

    this.rigInteraction = new RigInteractionController(this.camera, this.scene, this.renderer.domElement,this.chain.joints)
  }

  start() {
    this.animationId = requestAnimationFrame(this.animate);
  }

  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.renderer.dispose();
    this.controls.dispose();
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

  // expose the canvas for input handlers
  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  private animate = (time: number) => {

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };
}
