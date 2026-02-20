'use client';

import React, { memo } from 'react';
import { NodeView } from '@/ui/NodeView.jsx';
import { useWorkspaceProjection } from '@/runtime/projection';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

const __DEV__ = process.env.NODE_ENV !== 'production';

function devSkip(reason, node, details = {}) {
    if (!__DEV__) return;

    console.groupCollapsed(
        `%c[NodeView] render skipped – ${reason}`,
        'color:#e5533d;font-weight:600'
    );

    console.log('nodeId:', node?.id);
    console.log('layout:', node?.layout);
    if (Object.keys(details).length) {
        console.log('details:', details);
    }

    console.groupEnd();
}

function NodeRendererImpl({ node }) {
    const viewport = useWorkspaceProjection((state) => state.viewport);
    const { zoomTier } = useCanvasContext();
    if (!node) return null;

    const layout = node.layout;
    const vx = viewport?.x;
    const vy = viewport?.y;
    const vs = viewport?.scale;
    if (!layout) {
        devSkip('missing layout', node);
        return null;
    }
    if (!Number.isFinite(layout.x) || !Number.isFinite(layout.y) || !Number.isFinite(layout.width) || !Number.isFinite(layout.height)) {
        devSkip('non-finite layout values', node);
        return null;
    }
    if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vs)) {
        devSkip('invalid viewport', node, { viewport });
        return null;
    }

    const left = (layout.x - vx) * vs;
    const top = (layout.y - vy) * vs;
    const width = layout.width * vs;
    const height = layout.height * vs;
    if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) {
        devSkip('projection produced non-finite values', node, {
            left,
            top,
            width,
            height,
        });
        return null;
    }

    return (
        <NodeView
            node={node}
            rect={{ left, top, width, height }}
            zoomTier={zoomTier}
        />
    );
}

export const NodeRenderer = memo(
    NodeRendererImpl,
    (prev, next) => {
        const a = prev.node;
        const b = next.node;
        if (!a || !b) return a === b;
        const la = a.layout || {};
        const lb = b.layout || {};
        return la.x === lb.x && la.y === lb.y && la.width === lb.width && la.height === lb.height && a.opacity === b.opacity;
    }
);
