import { applyEvent } from '@/core/events/applyEvent.js';

export function simulateMergeState({ baseState, events }) {
    if (!baseState || !Array.isArray(events)) {
        return baseState;
    }

    let state = structuredClone(baseState);

    for (const event of events) {
        if (!event?.type) continue;

        state = applyEvent(state, event);
    }

    return state;
}
