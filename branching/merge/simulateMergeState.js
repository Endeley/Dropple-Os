// branching/merge/simulateMergeState.js

import { applyEvent } from '@/core/events/applyEvent';
import { applyLayoutPass } from '@/runtime/layout/applyLayoutPass';

/**
 * Simulate applying events to a state (no mutation).
 *
 * 🔒 Pure
 */
export function simulateMergeState({ baseState, events }) {
    let next = baseState;

    for (const evt of events) {
        next = applyEvent(next, {
            id: evt.id,
            type: evt.type,
            payload: evt.payload,
        });

        // Keep layout consistent with runtime
        next = applyLayoutPass(next);
    }

    return next;
}
