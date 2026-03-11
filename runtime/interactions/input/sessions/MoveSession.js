import { nanoid } from 'nanoid';
import { applyConstraints } from '@/runtime/constraints/applyConstraints.js';
import { computeMoveDelta } from '@/runtime/transforms/computeMoveDelta.js';

export class MoveSession {
    constructor(config = {}) {
        const {
            nodeIds,
            nodes = [],
            startPointer,
            transforms = null,
            bounds = null,
            snapTargets = [],
            snapToGrid = false,
            parentBounds = null,
        } = config;
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            throw new Error('[MoveSession] nodeIds required');
        }

        this.id = nanoid();
        this.type = 'move';
        this.nodeIds = nodeIds;
        this.nodes = nodes;
        this.startPointer = startPointer;
        this.currentPointer = startPointer;
        this.startTransforms = transforms;
        this.bounds = bounds;
        this.snapTargets = snapTargets;
        this.snapToGrid = snapToGrid;
        this.parentBounds = parentBounds;
        this.delta = { dx: 0, dy: 0 };
        this.guides = [];
    }

    start(_event) {}

    onBegin(payload) {
        if (payload?.startPointer) {
            this.startPointer = payload.startPointer;
            this.currentPointer = payload.startPointer;
        }
    }

    update(pointer) {
        const x = pointer?.x ?? pointer?.clientX;
        const y = pointer?.y ?? pointer?.clientY;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return this.delta;
        }

        this.currentPointer = { x, y };
        this.delta = computeMoveDelta(
            this.startPointer,
            this.currentPointer,
            this.bounds,
            this.snapTargets,
            { snapToGrid: this.snapToGrid },
        );
        if (this.nodes.length === 1 && this.parentBounds) {
            const [constrained] = applyConstraints(this.nodes, this.parentBounds, {
                dx: this.delta.dx,
                dy: this.delta.dy,
            });
            if (constrained?.delta) {
                this.delta = {
                    ...this.delta,
                    dx: constrained.delta.dx ?? this.delta.dx,
                    dy: constrained.delta.dy ?? this.delta.dy,
                };
            }
        }
        this.guides = this.delta.guides ?? [];
        return this.delta;
    }

    onPointerMove(pointer) {
        return this.update(pointer);
    }

    onPointerUp(pointer) {
        if (pointer?.x != null && pointer?.y != null) {
            this.currentPointer = { x: pointer.x, y: pointer.y };
            this.delta = computeMoveDelta(this.startPointer, this.currentPointer);
        }
    }

    getPreview() {
        return {
            kind: 'move',
            nodeIds: this.nodeIds,
            previewTransform: {
                dx: this.delta.dx,
                dy: this.delta.dy,
            },
            snapGuides: this.guides,
        };
    }

    commit() {
        return {
            type: 'move',
            nodeIds: this.nodeIds,
            delta: {
                dx: this.delta.dx,
                dy: this.delta.dy,
            },
        };
    }

    cancel() {}
}
