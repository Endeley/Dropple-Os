'use client';

import { canvasBus } from '@/ui/canvasBus.js';

export function NodeView({ node, rect, zoomTier = 'normal' }) {
    if (!node) return null;
    if (!rect) return null;

    const { left, top, width, height } = rect;
    if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) return null;

    function onPointerDown(e) {
        // Left mouse only
        if (e.button !== 0) return;

        // 🔑 CRITICAL: prevent canvas pan + selection conflict
        e.preventDefault();
        e.stopPropagation();

        // Capture pointer so drag survives fast movement
        e.currentTarget.setPointerCapture?.(e.pointerId);

        // UI emits intent only (no MoveSession here)
        canvasBus.emit('intent.node.pointerDown', {
            nodeId: node.id,
            pointer: { x: e.clientX, y: e.clientY },
            zoomTier,
            event: e,
        });
    }

    const showLabel = zoomTier !== 'far';
    const showFull = zoomTier === 'normal' || zoomTier === 'detail' || zoomTier === 'micro';

    const isFar = zoomTier === 'far';
    const isOverview = zoomTier === 'overview';

    const background = isFar ? 'rgba(147, 197, 253, 0.12)' : isOverview ? 'rgba(147, 197, 253, 0.2)' : '#e0e7ff';

    const border = isFar ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid #93c5fd';

    return (
        <div
            onPointerDown={onPointerDown}
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
