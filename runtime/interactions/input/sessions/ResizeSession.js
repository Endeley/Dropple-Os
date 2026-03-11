import { computeResizeDelta } from '@/runtime/transforms/computeResizeDelta.js';

export class ResizeSession {
    constructor(config = {}) {
        const { nodeIds, nodes = [], startPointer, handle = 'se', bounds = null } = config;
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            throw new Error('[ResizeSession] nodeIds required');
        }

        this.id = `resize:${nodeIds.join(',')}:${handle}`;
        this.type = 'resize';
        this.nodeIds = nodeIds;
        this.nodes = nodes;
        this.handle = handle;
        this.startPointer = startPointer;
        this.currentPointer = startPointer;
        this.startBounds = bounds;
        this.bounds = bounds;
        this.delta = { x: 0, y: 0 };
        this.resize = { width: 0, height: 0 };
    }

    onBegin(payload) {
        if (payload?.startPointer) {
            this.startPointer = payload.startPointer;
            this.currentPointer = payload.startPointer;
        }
        if (payload?.bounds) {
            this.startBounds = payload.bounds;
            this.bounds = payload.bounds;
        }
    }

    start(event) {
        this.onBegin(event);
    }

    update(pointer) {
        const x = pointer?.x ?? pointer?.clientX;
        const y = pointer?.y ?? pointer?.clientY;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return {
                resize: this.resize,
                delta: this.delta,
                bounds: this.bounds,
            };
        }

        this.currentPointer = { x, y };
        const result = computeResizeDelta(
            this.startPointer,
            this.currentPointer,
            this.startBounds,
            this.handle,
        );

        this.resize = result.resize;
        this.delta = result.delta;
        this.bounds = result.bounds;
        return result;
    }

    onPointerMove(pointer) {
        return this.update(pointer);
    }

    onPointerUp(pointer) {
        if (pointer?.x != null && pointer?.y != null) {
            this.update(pointer);
        }
    }

    getPreview() {
        return {
            kind: 'resize',
            nodeId: this.nodeIds[0] ?? null,
            previewBoundsWorld: this.bounds,
            snapGuides: [],
        };
    }

    commit() {
        return {
            type: 'resize',
            nodeIds: this.nodeIds,
            resize: this.resize,
            delta: this.delta,
            handle: this.handle,
        };
    }

    cancel() {}
}
