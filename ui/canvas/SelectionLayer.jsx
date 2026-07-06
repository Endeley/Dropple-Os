'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useCanvasContext, useCanvasVisualState } from '@/ui/canvas/CanvasContext.jsx';
import { useAvailability } from '@/ui/availability/useAvailability';
import { Availability } from '@/ui/availability/availability';
import { Capability } from '@/ui/capabilities/capabilityVocabulary';

function computeGroupBounds(ids, nodesById) {
    const nodes = ids.map((id) => nodesById?.[id]).filter(Boolean);
    if (nodes.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
        const b = node?.computed?.worldBounds || node?.computed;
        if (!b) return;

        const x = b.x ?? 0;
        const y = b.y ?? 0;
        const w = b.width ?? 0;
        const h = b.height ?? 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    });

    if (minX === Infinity) return null;

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

function GroupSelectionBox({ bounds }) {
    if (!bounds) return null;

    return (
        <div
            className='selection-group-box'
            style={{
                position: 'absolute',
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
            }}
        />
    );
}

export default function SelectionLayer() {
    const selection = useCanvasVisualState((s) => s.selection);
    const nodesById = useCanvasVisualState((s) => s.nodes || {});
    const { zoomTier, readOnly, immersiveFirstExpression } = useCanvasContext();

    const availability = useAvailability({
        readCaps: [Capability.NODE_SELECT],
    });

    const selectionIds = selection?.ids;

    // ----- GUARDS -----
    if (availability === Availability.HIDDEN) return null;
    if (readOnly) return null;
    if (immersiveFirstExpression) return null;
    if (zoomTier === 'far' || zoomTier === 'overview') return null;
    if (!Array.isArray(selectionIds) || selectionIds.length === 0) return null;

    const isSingle = selectionIds.length === 1;

    // ----- GROUP BOUNDS -----
    const groupBounds = !isSingle ? computeGroupBounds(selectionIds, nodesById) : null;

    return (
        <>
            {/* ----- MULTI SELECT: GROUP BOX ----- */}
            {!isSingle && <GroupSelectionBox bounds={groupBounds} />}

            {/* ----- INDIVIDUAL OUTLINES ----- */}
            {selectionIds.map((id) => {
                const node = nodesById?.[id];

                const isPrimary = selection?.primary === id;

                const resizeEnabled = isSingle && !node?.resizeLocked;
                const rotateEnabled = isSingle;

                return <SelectionOutline key={id} nodeId={id} isPrimary={isPrimary} resizeEnabled={resizeEnabled} rotateEnabled={rotateEnabled} />;
            })}
        </>
    );
}
