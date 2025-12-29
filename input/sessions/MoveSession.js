import { nanoid } from 'nanoid';
import { applyMoveConstraints } from '@/engine/constraints/constraintEngine';
import { computeReorderIndex } from '@/engine/layout/computeReorderIndex';
import { findDropTarget } from '@/engine/layout/findDropTarget';

export class MoveSession {
    constructor({ nodeIds, nodes = [], startPointer, siblings = [], canvas = null, options = {}, context = {} }) {
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            throw new Error('[MoveSession] nodeIds required');
        }

        this.id = nanoid();
        this.type = 'move';

        this.nodeIds = nodeIds;
        this.nodes = nodes;
        this.siblings = siblings;
        this.canvas = canvas;
        this.options = options;
        this.startPointer = startPointer;
        this.currentPointer = startPointer;
        this.delta = { x: 0, y: 0 };
        this.guides = [];
        this.context = context;
        this.reorderOrder = null;
        this.reorderIndex = null;
        this.sourceParentId = context?.sourceParentId;
        this.sourceLayoutMode = context?.sourceLayoutMode || 'none';
        this.allowedDropTargets = context?.allowedDropTargets || [];
    }

    start(event) {
        this.startEvent = event;
    }

    update(event) {
        const x = event.clientX;
        const y = event.clientY;

        this.currentPointer = { x, y };

        const rawDelta = {
            x: x - this.startPointer.x,
            y: y - this.startPointer.y,
        };

        if (this.context?.crossContainer) {
            const target = findDropTarget(this.currentPointer, this.context.allowedDropTargets || []);
            this.dropTarget = target;
            this.reorderIndex = target
                ? computeReorderIndex({
                      pointer: this.currentPointer,
                      container: target,
                      children: this.context.dropTargetChildren || [],
                  })
                : null;
            return;
        }

        if (this.context?.autoLayout) {
            this.delta = rawDelta;
            const index = computeReorderIndex({
                pointer: this.currentPointer,
                container: this.context.container,
                children: this.context.children,
            });

            this.reorderIndex = index;
            this.reorderOrder = this.computeReorderOrder();
            return;
        }

        const { delta, guides } = applyMoveConstraints({
            delta: rawDelta,
            nodes: this.nodes,
            siblings: this.siblings,
            canvas: this.canvas,
            options: this.options,
        });

        this.delta = delta;
        this.guides = guides;

        if (this.context?.isAutoLayoutChild) {
            this.reorderOrder = this.computeReorderOrder();
        }
    }

    getPreview() {
        if (this.context?.autoLayout) {
            return {
                type: 'reorder-preview',
                containerId: (this.dropTarget || this.context.container)?.id,
                index: this.reorderIndex,
                sourceContainerId: this.context.container?.id,
            };
        }

        return {
            type: 'move-preview',
            nodeIds: this.nodeIds,
            delta: this.delta,
            guides: this.guides,
        };
    }

    commit() {
        if (this.context?.autoLayout) {
            return {
                type: 'reorder',
                containerId: this.context.container?.id,
                nodeIds: this.nodeIds,
                index: this.reorderIndex,
            };
        }

        if (this.dropTarget && this.dropTarget.id !== this.context.sourceParentId) {
            return {
                type: 'reparent',
                nodeIds: this.nodeIds,
                from: this.context.sourceParentId,
                to: this.dropTarget.id,
                index: this.reorderIndex,
            };
        }

        return {
            type: 'move',
            nodeIds: this.nodeIds,
            delta: this.delta,
        };
    }

    cancel() {}

    computeReorderOrder() {
        const currentOrder = this.context?.parentChildren || [];
        const remaining = currentOrder.filter((id) => !this.nodeIds.includes(id));
        const idx = Math.max(0, Math.min(this.reorderIndex ?? 0, remaining.length));
        return [...remaining.slice(0, idx), ...this.nodeIds, ...remaining.slice(idx)];
    }
}
