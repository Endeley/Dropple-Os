// branching/merge/simulateMergeState.js

import { replayEvents } from '@/core/persistence/replayEngine.js';
import { applyLayoutPass } from '@/runtime/layout/index.js';

/**
 * Simulate applying events to a state (no mutation).
 *
 * 🔒 Pure
 */
export function simulateMergeState({ baseState, events }) {
    return replayEvents({
        events,
        initialState: baseState,
        onEvent(state) {
            return applyLayoutPass(state).nextState;
        },
    });
}
