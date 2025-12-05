// src/main.ts
import { App } from "./app.js";

console.log("main.ts starting");

const container = document.getElementById("viewport")!;
const app = new App(container);

// for debugging in console:
// @ts-ignore
(window as any).app = app;
