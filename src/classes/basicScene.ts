// basicScene.ts
import * as THREE from "three";

export class BasicScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;

  constructor(private container: HTMLElement) {
    console.log("BasicScene constructor", container);

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
    container.appendChild(this.renderer.domElement);

    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // <- no lights needed
    this.cube = new THREE.Mesh(geom, mat);
    this.scene.add(this.cube);

    this.scene.add(new THREE.AxesHelper(2));

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private animate() {
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  public resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
