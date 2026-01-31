'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { canvasBus } from '@/ui/canvasBus.js';

const CanvasHost = forwardRef(function CanvasHost({ children, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onWheel }, ref) {
    const localRef = useRef(null);
    useImperativeHandle(ref, () => localRef.current);

    useEffect(() => {
        const target = localRef.current;
        if (!target || !onWheel) return;

        const handleWheel = (e) => {
            onWheel(e);
        };

        target.addEventListener('wheel', handleWheel, { passive: false });
        return () => target.removeEventListener('wheel', handleWheel);
    }, [onWheel]);

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
                overflow: 'hidden', // 🔒 CRITICAL
                touchAction: 'none',
            }}>
            {children}
        </div>
    );
});

export default CanvasHost;
