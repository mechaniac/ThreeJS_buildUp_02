// src/edit/curveEditor.ts
import * as THREE from 'three';
import type { CurveModel, Vec3 } from '../math/curveModel.js';
import { setControlPoint } from '../math/curveModel.js';
import type { CurveView } from '../view/curveView.js';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export type CurveEditMode = 'curve' | 'vertex';

export interface CurveEditor {
  model: CurveModel;
  view: CurveView;
  mode: CurveEditMode;
  setMode(mode: CurveEditMode): void;
  onPointerDown(raycaster: THREE.Raycaster): boolean; // try to pick a vertex
  onGizmoChanged(): void; // should be called when gizmo fires 'change'
  getAttachedObject(): THREE.Object3D | null;
}

export function createCurveEditor(
  model: CurveModel,
  view: CurveView
): CurveEditor {
  let mode: CurveEditMode = 'curve';
  let activeIndex: number | null = null;

  function setHandlesVisible(visible: boolean) {
    for (const h of view.controlMeshes) h.visible = visible;
  }

  function setMode(newMode: CurveEditMode) {
    mode = newMode;

    if (mode === 'curve') {
      activeIndex = null;
      setHandlesVisible(false);
    } else {
      setHandlesVisible(true);
    }
  }

  // Try to pick a vertex; return true if we hit one
  function onPointerDown(raycaster: THREE.Raycaster): boolean {
    if (mode !== 'vertex') return false;

    const hits = raycaster.intersectObjects(view.controlMeshes, false);
    if (hits.length === 0) return false;

    const hitObj = hits[0]!.object;
    const idx = view.controlMeshes.indexOf(hitObj as THREE.Mesh);
    if (idx === -1) return false;

    activeIndex = idx;
    return true; // caller will attach gizmo to the returned object
  }

  function onGizmoChanged() {
    // If we're in vertex mode and have active index, we must push
    // the handle's position back into the model.
    if (mode === 'vertex' && activeIndex !== null) {
      const mesh = view.controlMeshes[activeIndex];
      const p: Vec3 = {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z,
      };
      setControlPoint(model, activeIndex, p);
      view.updateFromModel();
    } else if (mode === 'curve') {
      // whole group moved -> model points unchanged, view already ok
      // if you ever want to bake group transform back into model, you'd do it here
    }
  }

  // which Object3D should the gizmo attach to?
  function getAttachedObject(): THREE.Object3D | null {
    if (mode === 'curve') {
      return view.group;
    }
    if (mode === 'vertex' && activeIndex !== null) {
      return view.controlMeshes[activeIndex];
    }
    return view.group; // fallback
  }

  // initial state
  setMode('curve');

  return {
    model,
    view,
    get mode() {
      return mode;
    },
    setMode,
    onPointerDown,
    onGizmoChanged,
    getAttachedObject,
  };
}
