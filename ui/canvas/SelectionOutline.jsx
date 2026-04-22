'use client';

import { useMemo, useState } from 'react';
import { useCharacterRenderNodes } from '@/ui/canvas/hooks/useCharacterRenderNodes.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

const HANDLE_SIZE = 10;

function ResizeHandle({ nodeId, handle, cursor, style, testId = null, onResizeHandlePointerDown, onResizeHandlePointerMove, onResizeHandlePointerUp }) {
    return (
        <div
            data-testid={testId ?? `resize-handle-${handle}`}
            data-resize-handle={handle}
            onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.setPointerCapture?.(e.pointerId);
                onResizeHandlePointerDown?.(e, { nodeId, handle });
            }}
            onPointerMove={(e) => {
                onResizeHandlePointerMove?.(e, { nodeId, handle });
            }}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResizeHandlePointerDown?.(e, { nodeId, handle });
            }}
            onPointerUp={(e) => {
                onResizeHandlePointerUp?.(e, {
                    nodeId,
                    handle,
                    type: 'pointerup',
                });
                e.currentTarget.releasePointerCapture?.(e.pointerId);
            }}
            onPointerCancel={(e) => {
                onResizeHandlePointerUp?.(e, {
                    nodeId,
                    handle,
                    type: 'pointercancel',
                });
                e.currentTarget.releasePointerCapture?.(e.pointerId);
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            style={{
                position: 'absolute',
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                background: 'rgba(16,185,129,0.95)',
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.25)',
                cursor,
                pointerEvents: 'auto',
                ...style,
            }}
            title={`Resize (${handle})`}
        />
    );
}

export function SelectionOutline({ nodeId, color = 'rgba(59,130,246,0.6)', isPrimary = false, resizeEnabled = false, rotateEnabled = false }) {
    const nodes = useCharacterRenderNodes();
    const node = nodes?.[nodeId];

    const [showResizeLabel, setShowResizeLabel] = useState(false);

    const { onResizeHandlePointerDown, onResizeHandlePointerMove, onResizeHandlePointerUp, onRotateHandlePointerDown } = useCanvasContext();

    const rect = useMemo(() => {
        if (!node) return null;

        const layout = node.layout ?? {};
        const transform = node.transform ?? {};

        return {
            x: layout.x ?? transform.x ?? node.x ?? 0,
            y: layout.y ?? transform.y ?? node.y ?? 0,
            width: layout.width ?? node.width ?? 0,
            height: layout.height ?? node.height ?? 0,
        };
    }, [node]);

    if (!node || !rect) return null;

    const frameStyle = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
    };

    const outlineStyle = {
        position: 'absolute',
        inset: 0,
        border: `${isPrimary ? 2 : 1}px solid ${color}`,
        boxShadow: isPrimary ? `0 0 0 2px ${color}33` : `0 0 0 1px ${color}55`,
        borderRadius: 4,
        pointerEvents: 'none',
    };

    const handleOffset = -HANDLE_SIZE / 2;

    return (
        <div style={frameStyle}>
            <div data-testid='selection-outline' data-selection-node-id={nodeId} data-selection-primary={isPrimary ? 'true' : 'false'} style={outlineStyle} />

            {rotateEnabled && (
                <div
                    data-testid='rotate-handle'
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
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    style={{
                        position: 'absolute',
                        left: rect.width / 2 - 6,
                        top: -24,
                        width: 12,
                        height: 12,
                        background: 'rgba(245,158,11,0.95)',
                        borderRadius: 999,
                        border: '1px solid rgba(15,23,42,0.25)',
                        cursor: 'grab',
                        pointerEvents: 'auto',
                    }}
                    title='Rotate selection'
                />
            )}

            {resizeEnabled && (
                <>
                    <ResizeHandle nodeId={nodeId} handle='nw' cursor='nwse-resize' style={{ left: handleOffset, top: handleOffset }} onResizeHandlePointerDown={onResizeHandlePointerDown} onResizeHandlePointerMove={onResizeHandlePointerMove} onResizeHandlePointerUp={onResizeHandlePointerUp} />
                    <ResizeHandle nodeId={nodeId} handle='ne' cursor='nesw-resize' style={{ right: handleOffset, top: handleOffset }} onResizeHandlePointerDown={onResizeHandlePointerDown} onResizeHandlePointerMove={onResizeHandlePointerMove} onResizeHandlePointerUp={onResizeHandlePointerUp} />
                    <ResizeHandle nodeId={nodeId} handle='sw' cursor='nesw-resize' style={{ left: handleOffset, bottom: handleOffset }} onResizeHandlePointerDown={onResizeHandlePointerDown} onResizeHandlePointerMove={onResizeHandlePointerMove} onResizeHandlePointerUp={onResizeHandlePointerUp} />
                    <div
                        style={{
                            position: 'absolute',
                            right: handleOffset,
                            bottom: handleOffset,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            pointerEvents: 'auto',
                        }}
                        onMouseEnter={() => setShowResizeLabel(true)}
                        onMouseLeave={() => setShowResizeLabel(false)}>
                        <ResizeHandle nodeId={nodeId} handle='se' cursor='nwse-resize' testId='resize-handle' style={{ position: 'relative', left: 0, top: 0 }} onResizeHandlePointerDown={onResizeHandlePointerDown} onResizeHandlePointerMove={onResizeHandlePointerMove} onResizeHandlePointerUp={onResizeHandlePointerUp} />
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
                                opacity: showResizeLabel ? 1 : 0,
                                transform: showResizeLabel ? 'translateY(0)' : 'translateY(2px)',
                                transition: 'opacity 120ms ease, transform 120ms ease',
                            }}>
                            Resize
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
