// src/math/curveModel.ts

export type Vec3 = { x: number; y: number; z: number };

export interface CurveModel {
  id: string;
  points: Vec3[];   // control vertices in local space
  closed: boolean;
}

export function createCircleCurve(
  id: string,
  segments: number,
  radius: number
): CurveModel {
  const points: Vec3[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push({
      x: Math.cos(t) * radius,
      y: 0,
      z: Math.sin(t) * radius,
    });
  }
  return { id, points, closed: true };
}

// update a single CV
export function setControlPoint(
  curve: CurveModel,
  index: number,
  pos: Vec3
): void {
  if (index < 0 || index >= curve.points.length) return;
  curve.points[index] = { ...pos };
}

// convenience getter
export function getControlPoints(curve: CurveModel): Vec3[] {
  return curve.points;
}

// sampling on the curve – you can later plug in Catmull-Rom math here
export function sampleCurve(
  curve: CurveModel,
  segments: number
): Vec3[] {
  // For now you could even just interpolate linearly along the CVs,
  // or call into a Catmull-Rom helper later.
  // Placeholder: return control points directly.
  // In your actual code you already have CatmullRomCurve3; here it's just the "math layer".
  return curve.points;
}
