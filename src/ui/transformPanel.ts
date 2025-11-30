// src/ui/transformPanel.ts
import * as THREE from 'three';

export interface TransformPanel {
  updateFromTarget(): void;
  dispose(): void;
}

export function createTransformPanel(target: THREE.Object3D): TransformPanel {
  // Position
  const posX = document.getElementById('posX') as HTMLInputElement | null;
  const posY = document.getElementById('posY') as HTMLInputElement | null;
  const posZ = document.getElementById('posZ') as HTMLInputElement | null;

  // Rotation (degrees)
  const rotX = document.getElementById('rotX') as HTMLInputElement | null;
  const rotY = document.getElementById('rotY') as HTMLInputElement | null;
  const rotZ = document.getElementById('rotZ') as HTMLInputElement | null;

  // Scale
  const sclX = document.getElementById('sclX') as HTMLInputElement | null;
  const sclY = document.getElementById('sclY') as HTMLInputElement | null;
  const sclZ = document.getElementById('sclZ') as HTMLInputElement | null;

  // one-time null check so we fail fast if HTML is wrong
  if (
    !posX || !posY || !posZ ||
    !rotX || !rotY || !rotZ ||
    !sclX || !sclY || !sclZ
  ) {
    throw new Error('TransformPanel: one or more transform inputs not found in DOM');
  }

  const radToDeg = (r: number) => (r * 180) / Math.PI;
  const degToRad = (d: number) => (d * Math.PI) / 180;

  function updateFromTarget() {
    // Position
    posX!.value = target.position.x.toFixed(2);
    posY!.value = target.position.y.toFixed(2);
    posZ!.value = target.position.z.toFixed(2);

    // Rotation (radians → degrees)
    const e = target.rotation;
    rotX!.value = radToDeg(e.x).toFixed(1);
    rotY!.value = radToDeg(e.y).toFixed(1);
    rotZ!.value = radToDeg(e.z).toFixed(1);

    // Scale
    sclX!.value = target.scale.x.toFixed(2);
    sclY!.value = target.scale.y.toFixed(2);
    sclZ!.value = target.scale.z.toFixed(2);
  }

  function onInputChange() {
    // Position
    const px = parseFloat(posX!.value);
    const py = parseFloat(posY!.value);
    const pz = parseFloat(posZ!.value);

    if (!Number.isNaN(px)) target.position.x = px;
    if (!Number.isNaN(py)) target.position.y = py;
    if (!Number.isNaN(pz)) target.position.z = pz;

    // Rotation (degrees → radians)
    const rx = parseFloat(rotX!.value);
    const ry = parseFloat(rotY!.value);
    const rz = parseFloat(rotZ!.value);

    const e = target.rotation;
    if (!Number.isNaN(rx)) e.x = degToRad(rx);
    if (!Number.isNaN(ry)) e.y = degToRad(ry);
    if (!Number.isNaN(rz)) e.z = degToRad(rz);

    // Scale
    const sx = parseFloat(sclX!.value);
    const sy = parseFloat(sclY!.value);
    const sz = parseFloat(sclZ!.value);

    if (!Number.isNaN(sx)) target.scale.x = sx;
    if (!Number.isNaN(sy)) target.scale.y = sy;
    if (!Number.isNaN(sz)) target.scale.z = sz;
  }

  const allInputs = [posX, posY, posZ, rotX, rotY, rotZ, sclX, sclY, sclZ];

  for (const input of allInputs) {
    input!.addEventListener('input', onInputChange);
  }

  return {
    updateFromTarget,
    dispose() {
      for (const input of allInputs) {
        input!.removeEventListener('input', onInputChange);
      }
    },
  };
}
