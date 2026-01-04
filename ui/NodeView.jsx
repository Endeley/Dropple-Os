'use client';

import { canvasBus } from '@/ui/canvasBus.js';
import { MoveSession } from '@/input/sessions/MoveSession.js';

export function NodeView({ node }) {
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
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
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
