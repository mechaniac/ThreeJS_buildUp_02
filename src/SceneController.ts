// src/SceneController.ts
import * as THREE from "three";

export class SceneController {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private animationId: number | null = null;
    private lastTime = 0;
    private updateCallbacks: Array<(dt: number) => void> = [];

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

    /** start the render loop */
    start() {
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame(this.animate);
    }

    /** stop the render loop and clean up */
    dispose() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.renderer.dispose();
    }

    /** external API: add/remove objects to the scene */
    add(obj: THREE.Object3D) {
        this.scene.add(obj);
    }

    remove(obj: THREE.Object3D) {
        this.scene.remove(obj);
    }

    /** handle resize */
    resize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    /** expose camera if someone needs it (e.g. controls, raycaster) */
    getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    addUpdateCallback(fn: (dt: number) => void) {
        this.updateCallbacks.push(fn);
    }

    removeUpdateCallback(fn: (dt: number) => void) {
        this.updateCallbacks = this.updateCallbacks.filter(f => f !== fn);
    }

    // -------- private --------

    private animate = (time: number) => {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // call all registered updaters
        for (const fn of this.updateCallbacks) {
            fn(dt);
        }

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate);
    };
}
