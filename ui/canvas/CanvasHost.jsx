'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { canvasBus } from '@/ui/canvasBus.js';

/**
 * CanvasHost
 *
 * Screen-space container + infinite world transform.
 * Viewport stays fullscreen.
 * World stays fullscreen.
 * Only transform moves.
 */
const CanvasHost = forwardRef(function CanvasHost({ children, viewport, worldOffset, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onWheel }, ref) {
    const localRef = useRef(null);
    useImperativeHandle(ref, () => localRef.current);

    // Wheel handling
    useEffect(() => {
        const target = localRef.current;
        if (!target || !onWheel) return;

        const handleWheel = (e) => {
            onWheel(e);
        };

        target.addEventListener('wheel', handleWheel, { passive: false });
        return () => target.removeEventListener('wheel', handleWheel);
    }, [onWheel]);

    const tx = viewport ? -(viewport.x + (worldOffset?.x ?? 0)) : 0;
    const ty = viewport ? -(viewport.y + (worldOffset?.y ?? 0)) : 0;
    const scale = viewport?.scale ?? 1;

    return (
        <div
            ref={localRef}
            onPointerDown={onPointerDown}
            onPointerMove={(e) => {
                onPointerMove?.(e);
                canvasBus.emit('pointer.move', e);
            }}
            onPointerUp={(e) => {
                onPointerUp?.(e);
                canvasBus.emit('pointer.up', e);
            }}
            onPointerCancel={(e) => {
                onPointerCancel?.(e);
                canvasBus.emit('pointer.cancel', e);
            }}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden', // 🔒 clip world
                touchAction: 'none',
            }}>
            {/* 🌍 WORLD — FULLSCREEN, TRANSFORMED */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    willChange: 'transform',
                }}>
                {children}
            </div>
        </div>
    );
});

export default CanvasHost;
