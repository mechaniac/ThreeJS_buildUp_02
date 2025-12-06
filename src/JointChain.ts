// JointChain.ts
import { Joint } from './Joint.js';

export class JointChain {
  public readonly joints: Joint[];

  private constructor(joints: Joint[]) {
    this.joints = joints;
  }

  static createLinear(count: number, spacing: number): JointChain {
    const joints: Joint[] = [];

    for (let i = 0; i < count; i++) {
      const j = new Joint(i);
      if (i > 0) {
        joints[i - 1].add(j);
        j.position.y = spacing;
      }
      joints.push(j);
    }

    return new JointChain(joints);
  }

  get root(): Joint {
    return this.joints[0];
  }
}
