import { canvasBus } from '@/ui/canvasBus.js';
import { InputSessionManager } from '@/input/InputSessionManager.js';
import { dispatcher } from './dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { computeSelectionBounds } from '@/engine/constraints/selectionBounds.js';
import { registerEditEventBridge } from '@/ui/timeline/editEventBridge.js';

registerEditEventBridge();

const sessionManager = new InputSessionManager(canvasBus);

// pointer down
canvasBus.on('pointer.down', ({ session, event }) => {
    sessionManager.startSession(session, event);
});

// pointer move
canvasBus.on('pointer.move', (event) => {
    sessionManager.updateSession(event);
});

// pointer up
canvasBus.on('pointer.up', () => {
    const session = sessionManager.state.activeSession;
    const result = sessionManager.commitSession();

    if (result?.type === 'move') {
        const { nodeIds, delta } = result;

        nodeIds.forEach((id) => {
            dispatcher.dispatch({
                type: EventTypes.NODE_MOVE,
                payload: {
                    id,
                    xDelta: delta.x,
                    yDelta: delta.y,
                },
            });
        });

        canvasBus.emit('intent.edit.commit', {
            type: 'move',
            ids: nodeIds,
            source: 'canvas.move',
        });
    }

    if (result?.type === 'resize') {
        const nodes = session?.nodes || [];
        if (!nodes.length) return;

        const bounds = computeSelectionBounds(nodes);
        const resizeDelta = result.resize || { width: 0, height: 0 };
        const offset = result.delta || { x: 0, y: 0 };

        const nextWidth = Math.max(1, bounds.width + resizeDelta.width);
        const nextHeight = Math.max(1, bounds.height + resizeDelta.height);

        const scaleX = bounds.width === 0 ? 1 : nextWidth / bounds.width;
        const scaleY = bounds.height === 0 ? 1 : nextHeight / bounds.height;

        const originX = bounds.minX + offset.x;
        const originY = bounds.minY + offset.y;

        nodes.forEach((node) => {
            const relX = bounds.width === 0 ? 0 : (node.x - bounds.minX) / bounds.width;
            const relY = bounds.height === 0 ? 0 : (node.y - bounds.minY) / bounds.height;

            dispatcher.dispatch({
                type: EventTypes.NODE_UPDATE,
                payload: {
                    id: node.id,
                    patch: {
                        x: originX + relX * nextWidth,
                        y: originY + relY * nextHeight,
                        width: (node.width ?? 0) * scaleX,
                        height: (node.height ?? 0) * scaleY,
                    },
                },
            });
        });

        canvasBus.emit('intent.edit.commit', {
            type: 'resize',
            ids: nodes.map((node) => node.id),
            source: 'canvas.resize',
        });
    }
});

// pointer cancel
canvasBus.on('pointer.cancel', () => {
    sessionManager.cancelSession();
});

export { sessionManager };
