import { nanoid } from 'nanoid';
import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

let registered = false;
let warnedMissingDispatcher = false;

export function registerEditEventRuntimeBridge() {
    if (registered) return () => {};
    registered = true;

    function onCommit(intent) {
        const ids = intent?.ids || [];
        if (!ids.length) return;

        const type = intent?.type || 'layout';

        try {
            const dispatcher = getRuntimeDispatcher();
            dispatcher.dispatch({
                type: EventTypes.TIMELINE_EVENT_ADD,
                payload: {
                    event: {
                        id: nanoid(),
                        time: Date.now(),
                        type: `layout/${type}`,
                        payload: { ids, source: intent?.source || 'canvas' },
                    },
                },
            });
        } catch (err) {
            if (!warnedMissingDispatcher) {
                console.warn(
                    '[editEventRuntimeBridge] Dispatcher not available; skipping timeline event.',
                    err
                );
                warnedMissingDispatcher = true;
            }
        }
    }

    canvasBus.on('intent.edit.commit', onCommit);

    return () => {
        canvasBus.off('intent.edit.commit', onCommit);
        registered = false;
    };
}
