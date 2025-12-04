import { BasicScene } from "./classes/basicScene.js";
console.log("main.ts starting");

const container = document.getElementById("viewport")!;
console.log(container);
const sceneApp = new BasicScene(container);
console.log("BasicScene created");

window.addEventListener("resize", () => sceneApp.resize());
