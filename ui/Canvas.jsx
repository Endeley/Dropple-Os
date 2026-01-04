'use client';

import { useEffect, useRef } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { canvasBus } from '@/ui/canvasBus.js';
import { NodeView } from './NodeView.jsx';

export default function Canvas() {
    const nodes = useRuntimeStore((s) => s.nodes);
    const nodeList = Object.values(nodes);

    const onPointerMove = (e) => canvasBus.emit('pointer.move', e);
    const onPointerUp = (e) => canvasBus.emit('pointer.up', e);
    const onPointerCancel = (e) => canvasBus.emit('pointer.cancel', e);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#fafafa',
                overflow: 'hidden',
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
        >
            {nodeList.map((node) => (
                <NodeView key={node.id} node={node} />
            ))}
        </div>
    );
}
