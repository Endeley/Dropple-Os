import { computeRotationDelta } from '@/runtime/transforms/computeRotationDelta.js';

export class RotateSession {
    constructor(config = {}) {
        const {
            nodeIds,
            nodes = [],
            startPointerWorld,
            centerWorld = null,
            pivot = null,
        } = config;
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            throw new Error('[RotateSession] nodeIds required');
        }

        this.id = `rotate:${nodeIds.join(',')}`;
        this.type = 'rotate';
        this.nodeIds = nodeIds;
        this.nodes = nodes;
        this.centerWorld = pivot ?? centerWorld;
        this.startPointerWorld = startPointerWorld;
        this.currentPointerWorld = startPointerWorld;
        this.rotationDelta = 0;
    }

    onPointerMove(pointerWorld) {
        if (!pointerWorld) return;
        this.currentPointerWorld = pointerWorld;
        this.rotationDelta = computeRotationDelta(
            this.startPointerWorld,
            this.currentPointerWorld,
            this.centerWorld,
        ).rotation;
    }

    onPointerUp(pointerWorld) {
        if (pointerWorld?.x != null && pointerWorld?.y != null) {
            this.currentPointerWorld = pointerWorld;
        }
        this.rotationDelta = computeRotationDelta(
            this.startPointerWorld,
            this.currentPointerWorld,
            this.centerWorld,
        ).rotation;
    }

    getPreview() {
        return {
            kind: 'rotate',
            nodeIds: this.nodeIds,
            rotationDelta: this.rotationDelta,
            centerWorld: this.centerWorld,
            snapGuides: [],
        };
    }

    getCommitPayload() {
        return {
            type: 'rotate',
            nodeIds: this.nodeIds,
            rotationDelta: this.rotationDelta,
            rotation: this.rotationDelta,
        };
    }

    commit() {
        return this.getCommitPayload();
    }

    cancel() {}
}
