import { nanoid } from 'nanoid';
import { applyMoveConstraints } from '@/engine/constraints/constraintEngine';
import { resolveSnap } from '@/engine/constraints/snapEngine.js';
import { computeSelectionBounds } from '@/domain/geometry/selectionBounds.js';
import { computeReorderIndex } from '@/engine/layout/computeReorderIndex';
import { findDropTarget } from '@/engine/layout/findDropTarget';
import { perfStart, perfEnd } from '@/runtime/instrumentation/perfTracker.js';

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
        perfStart('move.update');
        const x = event?.x ?? event?.clientX;
        const y = event?.y ?? event?.clientY;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            perfEnd('move.update');
            return;
        }

        this.currentPointer = { x, y };

        let pointerWorld = this.currentPointer;
        let snapGuides = [];

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
            perfEnd('move.update');
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
            perfEnd('move.update');
            return;
        }

        if (!this.context?.autoLayout) {
            const bounds = computeSelectionBounds(this.nodes || []);
            const candidates = (this.siblings || [])
                .filter((node) => node && !this.nodeIds.includes(node.id))
                .map((node) => ({
                    nodeId: node.id,
                    bounds: {
                        x: node.x ?? node.layout?.x ?? 0,
                        y: node.y ?? node.layout?.y ?? 0,
                        width: node.width ?? node.layout?.width ?? 0,
                        height: node.height ?? node.layout?.height ?? 0,
                    },
                }));

            const snap = resolveSnap({
                pointerWorld,
                nodeBounds: bounds,
                candidates,
                gridSize: this.options?.gridSize ?? null,
                threshold: this.options?.snapThreshold ?? 6,
            });

            pointerWorld = snap.snappedPoint;
            snapGuides = snap.guides;
        }

        const rawDelta = {
            x: pointerWorld.x - this.startPointer.x,
            y: pointerWorld.y - this.startPointer.y,
        };

        const { delta, guides } = applyMoveConstraints({
            delta: rawDelta,
            nodes: this.nodes,
            siblings: this.siblings,
            canvas: this.canvas,
            options: this.options,
        });

        this.delta = delta;
        this.guides = snapGuides.length ? snapGuides : guides;

        if (this.context?.isAutoLayoutChild) {
            this.reorderOrder = this.computeReorderOrder();
        }
        perfEnd('move.update');
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
            kind: 'move',
            nodeIds: this.nodeIds,
            previewTransform: {
                dx: this.delta.x,
                dy: this.delta.y,
            },
            snapGuides: this.guides,
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

        // Timeline-aware move emits keyframe intent
        if (this.context?.timelineEnabled) {
            return {
                type: 'timeline-keyframe',
                nodeIds: this.nodeIds,
                time: this.context.frameTime,
                trackId: this.context.trackId,
                properties: {
                    x: this.delta.x,
                    y: this.delta.y,
                },
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
