'use client';

import { useMemo } from 'react';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';
import { useCanvasViewState } from '@/ui/canvas/CanvasContext.jsx';
import { resolveUIUXProjectEmergenceProjection } from './uiuxProjectEmergenceProjection.js';

function resolveWorldBounds(node) {
    const computed = node?.computed?.worldBounds ?? node?.computed ?? null;
    if (
        Number.isFinite(computed?.x) &&
        Number.isFinite(computed?.y) &&
        Number.isFinite(computed?.width) &&
        Number.isFinite(computed?.height)
    ) {
        return computed;
    }

    const layout = node?.layout ?? null;
    if (
        Number.isFinite(layout?.x) &&
        Number.isFinite(layout?.y) &&
        Number.isFinite(layout?.width) &&
        Number.isFinite(layout?.height)
    ) {
        return layout;
    }

    return null;
}

function projectBounds(bounds, viewport) {
    const topLeft = projectToViewport({ x: bounds.x, y: bounds.y }, viewport);
    return {
        left: topLeft.x,
        top: topLeft.y,
        width: bounds.width * viewport.scale,
        height: bounds.height * viewport.scale,
    };
}

/**
 * Project Emergence Projection
 *
 * Purpose:
 * Reveal truthful containment.
 *
 * This projection may reveal an existing parent/child relationship
 * already owned by the runtime.
 *
 * It may never infer, fabricate, explain, or manage containment.
 *
 * Success:
 * The creator naturally discovers:
 * "This belongs here."
 */
export function UIUXProjectEmergenceOverlay({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    nodesById = null,
    selectedNode = null,
}) {
    const viewport = useCanvasViewState((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    const projection = useMemo(
        () =>
            resolveUIUXProjectEmergenceProjection({
                workspaceId,
                modeId,
                nodeCount,
                selectedNode,
                nodesById,
            }),
        [modeId, nodeCount, nodesById, selectedNode, workspaceId],
    );

    const parentNode = projection?.parentNodeId ? nodesById?.[projection.parentNodeId] ?? null : null;
    const childNode = projection?.childNodeId ? nodesById?.[projection.childNodeId] ?? null : null;
    const parentBounds = parentNode ? resolveWorldBounds(parentNode) : null;
    const childBounds = childNode ? resolveWorldBounds(childNode) : null;

    const parentRect =
        parentBounds &&
        Number.isFinite(viewport?.scale) &&
        viewport.scale > 0
            ? projectBounds(parentBounds, viewport)
            : null;
    const childRect =
        childBounds &&
        Number.isFinite(viewport?.scale) &&
        viewport.scale > 0
            ? projectBounds(childBounds, viewport)
            : null;

    if (!projection || !parentRect || !childRect) return null;

    return (
        <div
            className='uiux-project-emergence'
            data-testid='uiux-project-emergence'
            data-parent-node-id={projection.parentNodeId}
            data-child-node-id={projection.childNodeId}
            aria-hidden='true'>
            <div
                className='uiux-project-emergence__parent'
                data-testid='uiux-project-emergence-parent'
                style={parentRect}
            />
            <div
                className='uiux-project-emergence__child'
                data-testid='uiux-project-emergence-child'
                style={childRect}
            />
        </div>
    );
}

export default UIUXProjectEmergenceOverlay;
