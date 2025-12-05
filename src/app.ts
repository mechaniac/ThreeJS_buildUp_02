// src/App.ts
import * as THREE from "three";
import { SceneController } from "./SceneController.js";

export class App {
    private sceneController: SceneController;
    private cube: THREE.Mesh;

    constructor(private container: HTMLElement) {
        this.sceneController = new SceneController(container);

        // demo content: a cube + axes
        const geom = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.cube = new THREE.Mesh(geom, mat);
        this.sceneController.add(this.cube);

        const axes = new THREE.AxesHelper(2);
        this.sceneController.add(axes);
        
        // per-frame rotation
        this.sceneController.addUpdateCallback((dt) => {
            this.spinCube(dt); // radians per second
        });

        // events
        window.addEventListener("resize", this.onResize);

        // start render loop
        this.sceneController.start();
    }

    do(s: string){
        return"s:" + s;
    }

    private onResize = () => {
        this.sceneController.resize();
    };

    /** later you can call this when switching pages */
    dispose() {
        window.removeEventListener("resize", this.onResize);
        this.sceneController.dispose();
    }

    /** example hook to animate the cube from outside if you want */
    spinCube(speed = 1) {
        this.cube.rotation.y += speed;
    }
}
