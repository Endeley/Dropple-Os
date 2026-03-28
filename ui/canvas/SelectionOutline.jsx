'use client';

import { useState } from 'react';
import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useWorkspaceViewState } from '@/runtime/projection';
import { projectRectToViewport } from '@/canvas/transform/projectRectToViewport.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

export function SelectionOutline({
    nodeId,
    color = 'rgba(59,130,246,0.6)',
    resizeEnabled = false,
    rotateEnabled = false,
}) {
    const nodes = useCharacterRenderNodes();
    const node = nodes?.[nodeId];
    const [showLabel, setShowLabel] = useState(false);
    const viewport = useWorkspaceViewState((state) => state.viewport);
    const { onResizeHandlePointerDown, onRotateHandlePointerDown } = useCanvasContext();
    if (!node) return null;
    const rect = projectRectToViewport(
        {
            x: node.x ?? 0,
            y: node.y ?? 0,
            width: node.width ?? 0,
            height: node.height ?? 0,
        },
        viewport || { x: 0, y: 0, scale: 1 },
    );

    const style = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
        border: `1px solid ${color}`,
        boxShadow: `0 0 0 1px ${color}55`,
    };

    return (
        <div
            data-testid="selection-outline"
            data-selection-node-id={nodeId}
            style={style}
        >
            {rotateEnabled && (
                <div
                    data-testid="rotate-handle"
                    onPointerDown={(e) => {
                        onRotateHandlePointerDown?.(e, { nodeId });
                    }}
                    onPointerUp={(e) => {
                        e.currentTarget.releasePointerCapture?.(e.pointerId);
                    }}
                    onPointerCancel={(e) => {
                        e.currentTarget.releasePointerCapture?.(e.pointerId);
                    }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: -22,
                        width: 10,
                        height: 10,
                        marginLeft: -5,
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
                        right: -4,
                        bottom: -4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        data-testid="resize-handle"
                        onPointerDown={(e) => {
                            onResizeHandlePointerDown?.(e, {
                                nodeId,
                                handle: 'se',
                            });
                        }}
                        onPointerUp={(e) => {
                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                        }}
                        onPointerCancel={(e) => {
                            e.currentTarget.releasePointerCapture?.(e.pointerId);
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
