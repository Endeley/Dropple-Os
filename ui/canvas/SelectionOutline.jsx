'use client';

import { useState } from 'react';
import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useWorkspaceProjection } from '@/runtime/projection';
import { projectRectToViewport } from '@/canvas/transform/projectRectToViewport.js';

export function SelectionOutline({
    nodeId,
    color = 'rgba(59,130,246,0.6)',
    resizeEnabled = false,
}) {
    const nodes = useCharacterRenderNodes();
    const node = nodes?.[nodeId];
    const [showLabel, setShowLabel] = useState(false);
    const viewport = useWorkspaceProjection((state) => state.viewport);
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
        <div style={style}>
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
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (process.env.NODE_ENV === 'development') {
                                console.warn('SESSION DISABLED');
                            }
                            return;
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
