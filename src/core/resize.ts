// src/core/resize.ts
import type { WebGLRenderer, PerspectiveCamera } from 'three';

/**
 * Sets up a resize handler that keeps the renderer and camera
 * in sync with the #viewport DOM element.
 *
 * Returns a function you can call to remove the listener.
 */
export function createResizeHandler(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  viewportId = 'viewport'
): () => void {
  function onResize() {
    const viewport = document.getElementById(viewportId) as HTMLDivElement | null;

    // Fallback to full window if #viewport is missing for some reason
    const w = viewport?.clientWidth ?? window.innerWidth;
    const h = viewport?.clientHeight ?? window.innerHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // attach listener
  window.addEventListener('resize', onResize);

  // do an initial resize so things are correct at startup
  onResize();

  // return disposer
  return () => {
    window.removeEventListener('resize', onResize);
  };
}
