import { applyConstraints } from '@/runtime/constraints/applyConstraints.js';
import { computeResizeDelta } from '@/runtime/transforms/computeResizeDelta.js';

function deriveBoundsFromNodes(nodes = []) {
    if (!nodes.length) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
        const x = node?.x ?? node?.layout?.x ?? 0;
        const y = node?.y ?? node?.layout?.y ?? 0;
        const width = node?.width ?? node?.layout?.width ?? 0;
        const height = node?.height ?? node?.layout?.height ?? 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    }

    if (!Number.isFinite(minX)) return null;

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

export class ResizeSession {
    constructor(config = {}) {
        const {
            nodeIds,
            nodes = [],
            startPointer,
            handle = 'se',
            bounds = null,
            snapTargets = [],
            parentBounds = null,
        } = config;
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
        this.startBounds = bounds ?? deriveBoundsFromNodes(nodes);
        this.bounds = this.startBounds;
        this.snapTargets = snapTargets;
        this.parentBounds = parentBounds;
        this.delta = { x: 0, y: 0 };
        this.resize = { width: 0, height: 0 };
        this.guides = [];
    }

    onBegin(payload) {
        if (payload?.startPointer) {
            this.startPointer = payload.startPointer;
            this.currentPointer = payload.startPointer;
        }
        if (payload?.bounds) {
            this.startBounds = payload.bounds;
            this.bounds = payload.bounds;
        } else if (!this.startBounds) {
            this.startBounds = deriveBoundsFromNodes(this.nodes);
            this.bounds = this.startBounds;
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
            this.snapTargets,
        );
        let nextResize = result.resize;
        let nextDelta = result.delta;

        if (this.nodes.length === 1 && this.parentBounds) {
            const [constrained] = applyConstraints(this.nodes, this.parentBounds, {
                dx: result.delta.x,
                dy: result.delta.y,
                width: result.resize.width,
                height: result.resize.height,
            });
            if (constrained?.delta) {
                nextResize = {
                    width: constrained.delta.width ?? nextResize.width,
                    height: constrained.delta.height ?? nextResize.height,
                };
                nextDelta = {
                    x: constrained.delta.dx ?? nextDelta.x,
                    y: constrained.delta.dy ?? nextDelta.y,
                };
            }
        }

        this.resize = nextResize;
        this.delta = nextDelta;
        this.bounds = {
            x: this.startBounds.x + this.delta.x,
            y: this.startBounds.y + this.delta.y,
            width: Math.max(1, this.startBounds.width + this.resize.width),
            height: Math.max(1, this.startBounds.height + this.resize.height),
        };
        this.guides = result.guides ?? [];
        return {
            ...result,
            resize: this.resize,
            delta: this.delta,
            bounds: this.bounds,
        };
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
            snapGuides: this.guides,
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
