'use client';

import React, { memo } from 'react';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

const __DEV__ = process.env.NODE_ENV !== 'production';

function devSkip(reason, node, details = {}) {
    if (!__DEV__) return;

    console.groupCollapsed(
        `%c[NodeRenderer] render skipped - ${reason}`,
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
    const { zoomTier } = useCanvasContext();
    if (!node) return null;

    const layout = node.layout;
    if (!layout) {
        devSkip('missing layout', node);
        return null;
    }
    if (!Number.isFinite(layout.x) || !Number.isFinite(layout.y) || !Number.isFinite(layout.width) || !Number.isFinite(layout.height)) {
        devSkip('non-finite layout values', node);
        return null;
    }
    const left = layout.x;
    const top = layout.y;
    const width = layout.width;
    const height = layout.height;
    if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) {
        devSkip('projection produced non-finite values', node, {
            left,
            top,
            width,
            height,
        });
        return null;
    }

    const showLabel = zoomTier !== 'far';
    const showFull = zoomTier === 'normal' || zoomTier === 'detail' || zoomTier === 'micro';
    const isFar = zoomTier === 'far';
    const isOverview = zoomTier === 'overview';
    const background = isFar
        ? 'rgba(147, 197, 253, 0.12)'
        : isOverview
            ? 'rgba(147, 197, 253, 0.2)'
            : '#e0e7ff';
    const border = isFar ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid #93c5fd';

    return (
        <div
            data-node-id={node.id}
            data-node-width={width}
            data-node-height={height}
            style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                background,
                color: '#111827',
                userSelect: 'none',
                cursor: 'grab',
                border,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: showFull ? 12 : 10,
                letterSpacing: showFull ? 0 : 0.3,
                boxSizing: 'border-box',
                pointerEvents: 'auto',
            }}>
            {showLabel ? node.id : null}
        </div>
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
