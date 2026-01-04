import { canvasBus } from '@/ui/canvasBus.js';
import { InputSessionManager } from '@/input/InputSessionManager.js';
import { dispatcher } from './dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';

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
    }
});

// pointer cancel
canvasBus.on('pointer.cancel', () => {
    sessionManager.cancelSession();
});

export { sessionManager };
