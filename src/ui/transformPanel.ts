// src/ui/transformPanel.ts
import * as THREE from 'three';

export interface TransformPanel {
  /** Copy target.position into the UI fields */
  updateFromTarget(): void;
  /** Clean up DOM listeners when you’re done */
  dispose(): void;
}

export function createTransformPanel(target: THREE.Object3D): TransformPanel {
  const posX = document.getElementById('posX') as HTMLInputElement | null;
  const posY = document.getElementById('posY') as HTMLInputElement | null;
  const posZ = document.getElementById('posZ') as HTMLInputElement | null;

  if (!posX || !posY || !posZ) {
    throw new Error('TransformPanel: position inputs not found in DOM');
  }

  // --- object -> UI

  function updateFromTarget() {
    posX!.value = target.position.x.toFixed(2);
    posY!.value = target.position.y.toFixed(2);
    posZ!.value = target.position.z.toFixed(2);
  }

  // --- (optional, later) UI -> object

  function onInputChange() {
    const x = parseFloat(posX!.value);
    const y = parseFloat(posY!.value);
    const z = parseFloat(posZ!.value);

    if (!Number.isNaN(x)) target.position.x = x;
    if (!Number.isNaN(y)) target.position.y = y;
    if (!Number.isNaN(z)) target.position.z = z;
  }

  posX.addEventListener('change', onInputChange);
  posY.addEventListener('change', onInputChange);
  posZ.addEventListener('change', onInputChange);

  // public API
  return {
    updateFromTarget,
    dispose() {
      posX.removeEventListener('change', onInputChange);
      posY.removeEventListener('change', onInputChange);
      posZ.removeEventListener('change', onInputChange);
    },
  };
}
