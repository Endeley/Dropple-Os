import { useRef } from 'react';
import { EventTypes } from '@/core/events/eventTypes.js';
import { useEventDispatcher } from '@/runtime/useEventDispatcher.js';

export function useNodeDrag(nodeId) {
    const dispatcher = useEventDispatcher();

    // ✅ Persistent mutable refs (NOT render state)
    const startXRef = useRef(0);
    const startYRef = useRef(0);

    function onPointerDown(e) {
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;

        e.target.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e, node) {
        if (e.buttons !== 1) return;

        const dx = e.clientX - startXRef.current;
        const dy = e.clientY - startYRef.current;

        dispatcher.dispatch({
            type: EventTypes.NODE_MOVE,
            payload: {
                id: nodeId,
                x: (node.x || 0) + dx,
                y: (node.y || 0) + dy,
            },
        });

        // update refs AFTER dispatch
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
    }

    function onPointerUp(e) {
        e.target.releasePointerCapture(e.pointerId);
    }

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp,
    };
}
