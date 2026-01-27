'use client';

import React from 'react';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';

/**
 * CanvasOriginMarker
 *
 * Visual marker for world origin (0,0).
 * UX-only, read-only, non-interactive.
 */
export function CanvasOriginMarker({ visible = true }) {
    const viewport = useWorkspaceState((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    if (!visible) return null;

    const screenX = -viewport.x * viewport.scale;
    const screenY = -viewport.y * viewport.scale;

    return (
        <div
            style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                width: 20,
                height: 20,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                opacity: 0.25,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    width: '100%',
                    height: 1,
                    background: '#999',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    height: '100%',
                    width: 1,
                    background: '#999',
                }}
            />
        </div>
    );
}
