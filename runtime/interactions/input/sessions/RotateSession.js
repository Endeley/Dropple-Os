const TAU = Math.PI * 2;

function normalizeAngle(angle) {
  let a = angle;
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}

export class RotateSession {
  constructor({ nodeIds, nodes, startPointerWorld, centerWorld }) {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      throw new Error('[RotateSession] nodeIds required');
    }

    this.id = `rotate:${nodeIds.join(',')}`;
    this.type = 'rotate';

    this.nodeIds = nodeIds;
    this.nodes = nodes || [];
    this.centerWorld = centerWorld;

    this.startPointerWorld = startPointerWorld;
    this.currentPointerWorld = startPointerWorld;

    this.startAngle = this.computeAngle(startPointerWorld);
    this.rotationDelta = 0;
  }

  computeAngle(pointerWorld) {
    const dx = pointerWorld.x - this.centerWorld.x;
    const dy = pointerWorld.y - this.centerWorld.y;
    return Math.atan2(dy, dx);
  }

  onPointerMove(pointerWorld) {
    if (!pointerWorld) return;
    this.currentPointerWorld = pointerWorld;

    const currentAngle = this.computeAngle(pointerWorld);
    const delta = currentAngle - this.startAngle;
    this.rotationDelta = normalizeAngle(delta);
  }

  onPointerUp(pointerWorld) {
    if (pointerWorld) {
      this.currentPointerWorld = pointerWorld;
    }
    const currentAngle = this.computeAngle(this.currentPointerWorld);
    const delta = currentAngle - this.startAngle;
    this.rotationDelta = normalizeAngle(delta);
  }

  getPreview() {
    return {
      kind: 'rotate',
      nodeIds: this.nodeIds,
      rotationDelta: this.rotationDelta,
      centerWorld: this.centerWorld,
    };
  }

  getCommitPayload() {
    return {
      type: 'rotate',
      nodeIds: this.nodeIds,
      rotationDelta: this.rotationDelta,
    };
  }

  commit() {
    return this.getCommitPayload();
  }
}
