'use client';

import { canvasBus } from '@/ui/canvasBus.js';
import { MoveSession } from '@/input/sessions/MoveSession.js';

export function NodeView({ node, position, scale = 1 }) {
    function onPointerDown(e) {
        e.preventDefault();

        const session = new MoveSession({
            nodeIds: [node.id],
            startPointer: { x: e.clientX, y: e.clientY },
        });

        canvasBus.emit('pointer.down', { session, event: e });
    }

    return (
        <div
            onPointerDown={onPointerDown}
            style={{
                position: 'absolute',
                left: position?.x ?? node.x,
                top: position?.y ?? node.y,
                width: (node.width ?? 0) * scale,
                height: (node.height ?? 0) * scale,
                background: '#e0e7ff',
                color: '#111827',
                userSelect: 'none',
                cursor: 'grab',
                border: '1px solid #93c5fd',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
            }}
        >
            {node.id}
        </div>
    );
}
