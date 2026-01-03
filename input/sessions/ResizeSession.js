import { nanoid } from 'nanoid';
import { applyResizeConstraints } from '@/engine/constraints/resizeConstraintEngine';
import { computeSelectionBounds } from '@/engine/constraints/selectionBounds';
import { perfStart, perfEnd } from '@/perf/perfTracker';

/**
 * Constraint-aware resize intent session.
 */
export class ResizeSession {
    constructor({ nodeIds, nodes, startPointer, handle, options = {} }) {
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            throw new Error('[ResizeSession] nodeIds required');
        }

        this.id = nanoid();
        this.type = 'resize';

        this.nodeIds = nodeIds;
        this.nodes = nodes; // selected nodes (authoritative snapshot)

        this.startPointer = startPointer;
        this.currentPointer = startPointer;

        this.handle = handle; // 'n','s','e','w','ne','nw','se','sw'
        this.options = options;
        this.lockAspectRatio = options.lockAspectRatio ?? false;

        const bounds = computeSelectionBounds(nodes);
        this.aspectRatio = options.aspectRatio ?? (bounds.height === 0 ? 1 : bounds.width / Math.max(bounds.height, 1));

        this.delta = { x: 0, y: 0 };
        this.resize = { width: 0, height: 0 };
        this.guides = [];
    }

    start(_event) {
        // no-op
    }

    update(event) {
        perfStart('resize.update');
        const x = event.clientX;
        const y = event.clientY;

        this.currentPointer = { x, y };

        const rawPointerDelta = {
            x: x - this.startPointer.x,
            y: y - this.startPointer.y,
        };

        const result = applyResizeConstraints({
            pointerDelta: rawPointerDelta,
            handle: this.handle,
            nodes: this.nodes,
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
        return {
            type: 'resize-preview',
            nodeIds: this.nodeIds,
            resize: this.resize,
            delta: this.delta,
            guides: this.guides,
            handle: this.handle,
        };
    }

    commit() {
        const result = applyResizeConstraints({
            pointerDelta: {
                x: this.currentPointer.x - this.startPointer.x,
                y: this.currentPointer.y - this.startPointer.y,
            },
            handle: this.handle,
            nodes: this.nodes,
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
