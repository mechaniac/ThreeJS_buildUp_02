import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
// import { createBoneChain } from "./BoneChain.js";
import { BoneChain } from "./BoneChainClass.js";

export class SceneController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbit: OrbitControls;

  private transformControls: TransformControls;
  private transformHelper: THREE.Object3D;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private chain: BoneChain;
  private selectedBone: THREE.Bone | null = null;

  constructor(private container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    // camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1, 4);

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // orbit
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;

    // bone chain
    this.chain = new BoneChain(5, 0.3);
    this.scene.add(this.chain.root);

    // skeleton helper (wireframe)
    const helper = new THREE.SkeletonHelper(this.chain.root);
    this.scene.add(helper);
    const mat = helper.material as THREE.LineBasicMaterial;
    mat.color.set(0xffaa00); // e.g. same orange as your selection spheres
    mat.vertexColors = false; // ignore per-vertex colors from geometry

    // TransformControls
    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControls.setMode("rotate");

    // helper object that must be added to scene
    this.transformHelper = this.transformControls.getHelper();
    this.scene.add(this.transformHelper);

    // disable orbit while dragging
    this.transformControls.addEventListener("dragging-changed", (e: any) => {
      this.orbit.enabled = !e.value;
    });

    // events
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);

    window.addEventListener("keydown", this.onKeyDown);

    // start
    requestAnimationFrame(this.animate);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'w':
        this.transformControls.setMode('translate');
        break;
      case 'e':
        this.transformControls.setMode('rotate');
        break;
      case 'r':
        this.transformControls.setMode('scale');
        break;
      case '1':
        this.transformControls.setSpace('world');
        break;
      case '2':
        this.transformControls.setSpace('local');
        break;
    }
  }

  private onPointerDown = (ev: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // only pick handle spheres
    const hits = this.raycaster.intersectObjects(this.chain.handles, false);
    if (hits.length === 0) return;

    const hit = hits[0];
    const bone = hit.object.userData.bone as THREE.Bone;
    this.selectBone(bone);
  };

  private selectBone(bone: THREE.Bone) {
    if (this.selectedBone === bone) return;

    this.selectedBone = bone;

    // reset all to white
    this.chain.handles.forEach(h => {
      const m = h.material as THREE.MeshBasicMaterial;
      m.color.set(0xffffff);
    });

    // color selected bone and all descendants
    const colorSubtree = (b: THREE.Bone) => {
      // find its handle child (if any)
      const handle = b.children.find(
        c => (c as any).userData && (c as any).userData.isHandle
      ) as THREE.Mesh | undefined;

      if (handle) {
        (handle.material as THREE.MeshBasicMaterial).color.set(0xffaa00);
      }

      // recurse into child bones
      for (const child of b.children) {
        if (child instanceof THREE.Bone) {
          colorSubtree(child as THREE.Bone);
        }
      }
    };

    colorSubtree(bone);

    // attach transform control to the selected bone
    this.transformControls.attach(bone);
  }


  private animate = () => {
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };
}
