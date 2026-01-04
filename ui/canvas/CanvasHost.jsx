'use client';

import { canvasBus } from '@/ui/canvasBus.js';

export default function CanvasHost({ children }) {
    const onPointerMove = (e) => canvasBus.emit('pointer.move', e);
    const onPointerUp = (e) => canvasBus.emit('pointer.up', e);
    const onPointerCancel = (e) => canvasBus.emit('pointer.cancel', e);

    return (
        <div
            className='relative w-full h-full overflow-hidden touch-none'
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{ position: 'relative', width: '100%', height: '100%' }}
        >
            {children}
        </div>
    );
}
