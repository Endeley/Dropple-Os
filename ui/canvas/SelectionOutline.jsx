'use client';

import { useState } from 'react';
import { useCharacterRenderNodes } from '@/ui/canvas/hooks/useCharacterRenderNodes.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

export function SelectionOutline({
    nodeId,
    color = 'rgba(59,130,246,0.6)',
    isPrimary = false,
    resizeEnabled = false,
    rotateEnabled = false,
}) {
    const nodes = useCharacterRenderNodes();
    const node = nodes?.[nodeId];
    const [showLabel, setShowLabel] = useState(false);
    const {
        onResizeHandlePointerDown,
        onResizeHandlePointerMove,
        onResizeHandlePointerUp,
        onRotateHandlePointerDown,
    } = useCanvasContext();
    if (!node) return null;
    const layout = node.layout ?? {};
    const rect = {
        x: layout.x ?? node.x ?? 0,
        y: layout.y ?? node.y ?? 0,
        width: layout.width ?? node.width ?? 0,
        height: layout.height ?? node.height ?? 0,
    };

    const outlineStyle = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `${isPrimary ? 2 : 1}px solid ${color}`,
        boxShadow: isPrimary ? `0 0 0 2px ${color}33` : `0 0 0 1px ${color}55`,
        pointerEvents: 'none',
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                pointerEvents: 'none',
            }}
        >
            <div
                data-testid="selection-outline"
                data-selection-node-id={nodeId}
                data-selection-primary={isPrimary ? 'true' : 'false'}
                style={outlineStyle}
            />
            {rotateEnabled && (
                <div
                    data-testid="rotate-handle"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.setPointerCapture?.(e.pointerId);
                        onRotateHandlePointerDown?.(e, { nodeId });
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRotateHandlePointerDown?.(e, { nodeId });
                    }}
                    onPointerUp={(e) => {
                        e.currentTarget.releasePointerCapture?.(e.pointerId);
                    }}
                    onPointerCancel={(e) => {
                        e.currentTarget.releasePointerCapture?.(e.pointerId);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    style={{
                        position: 'absolute',
                        left: rect.width / 2 - 5,
                        top: -22,
                        width: 10,
                        height: 10,
                        background: 'rgba(245, 158, 11, 0.95)',
                        borderRadius: 999,
                        border: '1px solid rgba(15,23,42,0.25)',
                        cursor: 'grab',
                        pointerEvents: 'auto',
                    }}
                    title="Rotate selection"
                />
            )}
            {resizeEnabled && (
                <div
                    style={{
                        position: 'absolute',
                        right: -6,
                        bottom: -6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        pointerEvents: 'auto',
                    }}
                >
                    <div
                        data-testid="resize-handle"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.setPointerCapture?.(e.pointerId);
                            onResizeHandlePointerDown?.(e, {
                                nodeId,
                                handle: 'se',
                            });
                        }}
                        onPointerMove={(e) => {
                            onResizeHandlePointerMove?.(e, {
                                nodeId,
                                handle: 'se',
                            });
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onResizeHandlePointerDown?.(e, {
                                nodeId,
                                handle: 'se',
                            });
                        }}
                        onPointerUp={(e) => {
                            onResizeHandlePointerUp?.(e, {
                                nodeId,
                                handle: 'se',
                                type: 'pointerup',
                            });
                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                        }}
                        onPointerCancel={(e) => {
                            onResizeHandlePointerUp?.(e, {
                                nodeId,
                                handle: 'se',
                                type: 'pointercancel',
                            });
                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                        }}
                        onMouseUp={(e) => {
                            e.preventDefault();
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onMouseEnter={() => setShowLabel(true)}
                        onMouseLeave={() => setShowLabel(false)}
                        style={{
                            width: 10,
                            height: 10,
                            background: 'rgba(16,185,129,0.95)',
                            borderRadius: 3,
                            border: '1px solid rgba(15,23,42,0.25)',
                            cursor: 'se-resize',
                            pointerEvents: 'auto',
                        }}
                        title="Resize container"
                    />
                    <span
                        style={{
                            fontSize: 10,
                            padding: '1px 4px',
                            borderRadius: 4,
                            background: 'rgba(15,23,42,0.7)',
                            color: '#e2e8f0',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            pointerEvents: 'none',
                            opacity: showLabel ? 1 : 0,
                            transform: showLabel ? 'translateY(0)' : 'translateY(2px)',
                            transition: 'opacity 120ms ease, transform 120ms ease',
                        }}
                    >
                        Container
                    </span>
                </div>
            )}
        </div>
    );
}
