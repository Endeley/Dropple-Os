'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { canvasBus } from '../eventBus/canvasBus.js';

/**
 * CanvasHost
 *
 * Screen-space container + infinite world transform.
 * Viewport stays fullscreen.
 * World stays fullscreen.
 * Only transform moves.
 */
const CanvasHost = forwardRef(function CanvasHost(
    {
        children,
        viewport,
        worldOffset,
        cameraTransform,
        onMount, // ✅ NEW
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onWheel,
        onDoubleClick,
    },
    ref,
) {
    const localRef = useRef(null);
    useImperativeHandle(ref, () => localRef.current);

    function emitPointer(type, payload) {
        canvasBus.emit(type, payload);
    }

    // Notify parent once when DOM is ready
    useEffect(() => {
        if (!localRef.current) return;
        onMount?.(localRef.current);
        // run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Wheel handling (non-passive so zoom works)
    useEffect(() => {
        const target = localRef.current;
        if (!target || !onWheel) return;

        const handleWheel = (e) => {
            e.preventDefault();
            onWheel(e);
        };
        target.addEventListener('wheel', handleWheel, { passive: false });

        return () => target.removeEventListener('wheel', handleWheel);
    }, [onWheel]);

    const cameraX = cameraTransform?.x ?? 0;
    const cameraY = cameraTransform?.y ?? 0;
    const cameraZoom = cameraTransform?.zoom ?? 1;
    const cameraRotation = cameraTransform?.rotation ?? 0;

    const tx = viewport ? -(viewport.x + (worldOffset?.x ?? 0) + cameraX) : 0;
    const ty = viewport ? -(viewport.y + (worldOffset?.y ?? 0) + cameraY) : 0;
    const scale = (viewport?.scale ?? 1) * cameraZoom;

    return (
        <div
            ref={localRef}
            data-testid="canvas-host"
            onPointerDown={(e) => {
                onPointerDown?.(e);
                emitPointer('pointer.down', {
                    event: e,
                    session: null,
                });
            }}
            onPointerMove={(e) => {
                onPointerMove?.(e);
                emitPointer('pointer.move', e);
            }}
            onPointerUp={(e) => {
                onPointerUp?.(e);
                emitPointer('pointer.up', e);
            }}
            onPointerCancel={(e) => {
                onPointerCancel?.(e);
                emitPointer('pointer.cancel', e);
            }}
            onDoubleClick={onDoubleClick}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                touchAction: 'none',
                userSelect: 'none',
            }}>
            {/* 🌍 WORLD — FULLSCREEN, TRANSFORMED */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${cameraRotation}rad)`,
                    transformOrigin: '0 0',
                    willChange: 'transform',
                }}>
                {children}
            </div>
        </div>
    );
});

export default CanvasHost;
