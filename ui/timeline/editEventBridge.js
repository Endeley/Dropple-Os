'use client';

import { nanoid } from 'nanoid';
import { canvasBus } from '@/ui/canvasBus';
import { dispatcher } from '@/ui/interaction/dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerEditEventBridge() {
    if (registered) return () => {};
    registered = true;

    let warned = false;

    function onCommit(intent) {
        const ids = intent?.ids || [];
        if (!ids.length) return;

        const type = intent?.type || 'layout';

        try {
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
            if (!warned) {
                console.warn(
                    '[editEventBridge] Dispatcher not attached; skipping timeline event.',
                    err
                );
                warned = true;
            }
        }
    }

    canvasBus.on('intent.edit.commit', onCommit);

    return () => {
        canvasBus.off('intent.edit.commit', onCommit);
        registered = false;
    };
}
