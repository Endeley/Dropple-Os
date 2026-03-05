import { applyResizeConstraints } from '@/engine/constraints/resizeConstraintEngine';
import { computeSelectionBounds } from '../../../../domain/geometry/selectionBounds.js';
import { perfStart, perfEnd } from '@/runtime/instrumentation/perfTracker.js';

/**
 * Constraint-aware resize intent session.
 */
export class ResizeSession {
    constructor({ nodeIds, nodes, startPointer, handle, siblings = [], canvas = null, options = {} }) {
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            throw new Error('[ResizeSession] nodeIds required');
        }

        this.id = `resize:${nodeIds.join(',')}:${handle ?? 'se'}`;
        this.type = 'resize';

        this.nodeIds = nodeIds;
        this.nodes = nodes; // selected nodes (authoritative snapshot)

        this.startPointer = startPointer;
        this.currentPointer = startPointer;

        this.handle = handle; // 'n','s','e','w','ne','nw','se','sw'
        this.options = options;
        this.lockAspectRatio = options.lockAspectRatio ?? false;
        this.siblings = siblings;
        this.canvas = canvas;

        const bounds = computeSelectionBounds(nodes);
        this.bounds = bounds;
        this.aspectRatio = options.aspectRatio ?? (bounds.height === 0 ? 1 : bounds.width / Math.max(bounds.height, 1));

        this.delta = { x: 0, y: 0 };
        this.resize = { width: 0, height: 0 };
        this.guides = [];
    }

    onBegin(payload) {
        if (payload?.startPointer) {
            this.startPointer = payload.startPointer;
            this.currentPointer = payload.startPointer;
        }
    }

    start(_event) {
        this.onBegin(_event);
    }

    onPointerMove(pointer) {
        this.update(pointer);
    }

    update(event) {
        perfStart('resize.update');
        const x = event?.x ?? event?.clientX;
        const y = event?.y ?? event?.clientY;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            perfEnd('resize.update');
            return;
        }

        this.currentPointer = { x, y };

        const rawPointerDelta = {
            x: x - this.startPointer.x,
            y: y - this.startPointer.y,
        };

        const result = applyResizeConstraints({
            pointerDelta: rawPointerDelta,
            handle: this.handle,
            nodes: this.nodes,
            siblings: this.siblings,
            canvas: this.canvas,
            options: {
                ...this.options,
                lockAspectRatio: this.lockAspectRatio,
                aspectRatio: this.aspectRatio,
            },
        });

        this.resize = result.resize;
        this.delta = result.delta; // position shift if resizing from left/top
        this.guides = result.guides ?? [];
        perfEnd('resize.update');
    }

    getPreview() {
        const bounds = this.bounds;
        const resize = this.resize || { width: 0, height: 0 };
        const delta = this.delta || { x: 0, y: 0 };

        const nextWidth = Math.max(1, bounds.width + resize.width);
        const nextHeight = Math.max(1, bounds.height + resize.height);
        const originX = bounds.minX + delta.x;
        const originY = bounds.minY + delta.y;

        return {
            kind: 'resize',
            nodeId: this.nodeIds[0] ?? null,
            previewBoundsWorld: {
                x: originX,
                y: originY,
                width: nextWidth,
                height: nextHeight,
            },
        };
    }

    onPointerUp(pointer) {
        if (pointer?.x != null && pointer?.y != null) {
            this.currentPointer = { x: pointer.x, y: pointer.y };
        }
    }

    commit() {
        const result = applyResizeConstraints({
            pointerDelta: {
                x: this.currentPointer.x - this.startPointer.x,
                y: this.currentPointer.y - this.startPointer.y,
            },
            handle: this.handle,
            nodes: this.nodes,
            siblings: this.siblings,
            canvas: this.canvas,
            options: {
                ...this.options,
                lockAspectRatio: this.lockAspectRatio,
                aspectRatio: this.aspectRatio,
            },
        });

        return {
            type: 'resize',
            nodeIds: this.nodeIds,
            resize: result.resize,
            delta: result.delta,
            handle: this.handle,
        };
    }

    cancel() {}
}
