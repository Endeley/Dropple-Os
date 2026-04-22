'use client';

import React, { memo } from 'react';
import { useCanvasContext, useCanvasVisualState } from '@/ui/canvas/CanvasContext.jsx';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { resolveToken } from '@/runtime/tokens/resolveToken.js';

const __DEV__ = process.env.NODE_ENV !== 'production';

function devSkip(reason, node, details = {}) {
    if (!__DEV__) return;

    console.groupCollapsed(`%c[NodeRenderer] render skipped - ${reason}`, 'color:#e5533d;font-weight:600');

    console.log('nodeId:', node?.id);
    console.log('layout:', node?.layout);
    if (Object.keys(details).length) console.log('details:', details);

    console.groupEnd();
}

function NodeRendererImpl({ node }) {
    const { zoomTier } = useCanvasContext();
    const selection = useCanvasVisualState((s) => s.selection);
    const tokens = useRuntimeStore((state) => state.tokens || {});

    if (!node) return null;

    const layout = node.layout;

    if (!layout) {
        devSkip('missing layout', node);
        return null;
    }

    const { x, y, width, height, rotation = 0 } = layout;

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
        devSkip('invalid layout', node, { x, y, width, height });
        return null;
    }

    const isSelected = selection?.ids?.includes(node.id);
    const isPrimary = selection?.primary === node.id;
    const style = node.style || {};
    const rawFill =
        style.fills?.find((entry) => entry?.enabled !== false)?.color ??
        style.fill ??
        null;
    const fillColor = resolveToken(rawFill, tokens);
    const opacity = Number.isFinite(style.opacity) ? Math.max(0, Math.min(style.opacity, 1)) : 1;
    const rawStroke =
        style.strokes?.find((entry) => entry?.enabled !== false) ??
        style.stroke ??
        null;
    const strokeColor = rawStroke ? resolveToken(rawStroke.color, tokens) : null;

    // ----- ZOOM LOGIC -----
    const showLabel = zoomTier !== 'far';
    const showFull = zoomTier === 'normal' || zoomTier === 'detail' || zoomTier === 'micro';

    // ----- VISUAL STYLE -----
    const fallbackBackground = zoomTier === 'far' ? 'rgba(147,197,253,0.12)' : zoomTier === 'overview' ? 'rgba(147,197,253,0.2)' : '#e0e7ff';
    const background = fillColor ?? fallbackBackground;

    const baseBorder = rawStroke
        ? `${Number.isFinite(rawStroke.width) ? rawStroke.width : 1}px solid ${strokeColor || '#000000'}`
        : '1px solid #93c5fd';
    const border = isPrimary ? '2px solid #3b82f6' : isSelected ? '1px solid #60a5fa' : baseBorder;

    const zIndex = node.zIndex ?? 0;

    return (
        <div
            data-node-id={node.id}
            className={`node-renderer ${isSelected ? 'is-selected' : ''} ${isPrimary ? 'is-primary' : ''}`}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                height,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center',
                zIndex,

                background,
                border,
                borderRadius: 4,
                opacity,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                fontSize: showFull ? 12 : 10,
                letterSpacing: showFull ? 0 : 0.3,

                color: '#111827',
                userSelect: 'none',
                cursor: 'grab',
                boxSizing: 'border-box',
            }}>
            {showLabel ? node.id : null}
        </div>
    );
}

export const NodeRenderer = memo(NodeRendererImpl, (prev, next) => {
    const a = prev.node;
    const b = next.node;

    if (!a || !b) return a === b;

    const la = a.layout || {};
    const lb = b.layout || {};
    const sa = a.style || {};
    const sb = b.style || {};

    return la.x === lb.x &&
        la.y === lb.y &&
        la.width === lb.width &&
        la.height === lb.height &&
        la.rotation === lb.rotation &&
        a.zIndex === b.zIndex &&
        sa.fill === sb.fill &&
        sa.opacity === sb.opacity &&
        JSON.stringify(sa.fills ?? null) === JSON.stringify(sb.fills ?? null) &&
        JSON.stringify(sa.strokes ?? null) === JSON.stringify(sb.strokes ?? null) &&
        JSON.stringify(sa.stroke ?? null) === JSON.stringify(sb.stroke ?? null);
});
