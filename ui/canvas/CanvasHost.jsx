'use client';

import { forwardRef } from 'react';
import { canvasBus } from '@/ui/canvasBus.js';

const CanvasHost = forwardRef(function CanvasHost(
    { children, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onWheel },
    ref
) {
    const handlePointerDown = (e) => {
        onPointerDown?.(e);
    };

    const handlePointerMove = (e) => {
        onPointerMove?.(e);
        canvasBus.emit('pointer.move', e);
    };

    const handlePointerUp = (e) => {
        onPointerUp?.(e);
        canvasBus.emit('pointer.up', e);
    };

    const handlePointerCancel = (e) => {
        onPointerCancel?.(e);
        canvasBus.emit('pointer.cancel', e);
    };

    const handleWheel = (e) => {
        onWheel?.(e);
    };

    return (
        <div
            ref={ref}
            className='relative w-full h-full overflow-hidden touch-none'
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onWheel={handleWheel}
            style={{ position: 'relative', width: '100%', height: '100%' }}
        >
            {children}
        </div>
    );
});

export default CanvasHost;
