import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SkeletonHelper } from "three";
import { BoneChain } from "./BoneChainClass.js";
import { SelectionManager } from "./SelectionManager.js";
import { TransformControlsManager } from "./TransformControlsManager.js";

export class SceneController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbit: OrbitControls;

  private chain: BoneChain;
  private selectionManager: SelectionManager;
  private transformMgr: TransformControlsManager;

  private selectedBone: THREE.Bone | null = null;

  constructor(private container: HTMLElement) {
    // scene/camera/renderer/orbit as before...

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1, 4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;

    // bone chain
    this.chain = new BoneChain(5, 0.3);
    this.scene.add(this.chain.root);

    const helper = new THREE.SkeletonHelper(this.chain.root);
    this.scene.add(helper);
    const mat = helper.material as THREE.LineBasicMaterial;
    mat.color.set(0xffaa00);
    mat.vertexColors = false;

    // transform controls manager
    this.transformMgr = new TransformControlsManager(
      this.camera,
      this.renderer.domElement,
      this.orbit
    );
    this.scene.add(this.transformMgr.getHelper());

    this.transformMgr.controls.addEventListener("objectChange", () => {
      const bone = this.transformMgr.controls.object as THREE.Bone;
      if (!bone || !(bone as any).isBone) return;

      this.updateSegmentsAroundBone(bone);
    });


    // selection manager
    this.selectionManager = new SelectionManager(
      this.camera,
      this.renderer.domElement,
      (obj) => this.onObjectSelected(obj)
    );
    this.selectionManager.setSelectables(this.chain.handles);

    requestAnimationFrame(this.animate);
  }

  private updateSegmentsAroundBone(bone: THREE.Bone) {
    // 1) parent segment (if parent is a bone)
    const parent = bone.parent as THREE.Bone;
    if (parent && (parent as any).isBone) {
      this.chain.updateSegmentForParent(parent);
    }

    // 2) segment starting at this bone
    // this.chain.updateSegmentForParent(bone);
  }


  private onObjectSelected = (obj: THREE.Object3D | null) => {
    if (!obj) return;
    const bone = obj.userData.bone as THREE.Bone;
    this.selectBone(bone);
  };

  private selectBone(bone: THREE.Bone) {
    if (this.selectedBone === bone) return;
    this.selectedBone = bone;

    // reset colors
    this.chain.handles.forEach(h => {
      const m = h.material as THREE.MeshBasicMaterial;
      m.color.set(0xffffff);
    });

    // color subtree
    const colorSubtree = (b: THREE.Bone) => {
      const handle = b.children.find(
        c => (c as any).userData && (c as any).userData.isHandle
      ) as THREE.Mesh | undefined;

      if (handle) {
        (handle.material as THREE.MeshBasicMaterial).color.set(0xffaa00);
      }

      for (const child of b.children) {
        if (child instanceof THREE.Bone) {
          colorSubtree(child as THREE.Bone);
        }
      }
    };

    colorSubtree(bone);
    this.transformMgr.attach(bone);
  }

  private animate = () => {
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };
}
