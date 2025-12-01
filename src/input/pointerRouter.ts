// src/input/pointerRouter.ts
import * as THREE from 'three';
import type { CurveEditor } from '../edit/curveEditor.js';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export interface PointerRouter {
  addCurveEditor(editor: CurveEditor): void;
  removeCurveEditor(editor: CurveEditor): void;
  getActiveEditor(): CurveEditor | null;
  dispose(): void;
}

export function createPointerRouter(
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera,
  gizmo: TransformControls & THREE.Object3D
): PointerRouter {
  const editors: CurveEditor[] = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let activeEditor: CurveEditor | null = null;

  function setActiveEditor(editor: CurveEditor | null) {
    activeEditor = editor;
    if (activeEditor) {
      const obj = activeEditor.getAttachedObject();
      if (obj) gizmo.attach(obj);
    } else {
      gizmo.detach();
    }
  }

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerDown(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);

    // Try all editors; first that returns true "wins"
    for (const editor of editors) {
      if (editor.onPointerDown(raycaster)) {
        setActiveEditor(editor);
        return;
      }
    }

    // If nothing hit and we want to deselect:
    // setActiveEditor(null);
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  return {
    addCurveEditor(editor) {
      editors.push(editor);
    },
    removeCurveEditor(editor) {
      const i = editors.indexOf(editor);
      if (i !== -1) editors.splice(i, 1);
    },
    getActiveEditor() {
      return activeEditor;
    },
    dispose() {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    },
  };
}
