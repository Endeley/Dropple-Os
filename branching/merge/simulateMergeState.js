import { replayEvents } from '@/core/persistence/replayEngine.js';

export function simulateMergeState({ baseState, events }) {
    if (!baseState || !Array.isArray(events)) {
        return baseState;
    }

    return replayEvents({
        events,
        initialState: structuredClone(baseState),
    });
}
