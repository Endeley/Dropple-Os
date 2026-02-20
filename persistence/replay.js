import { applyEvent } from '@/core/events/applyEvent.js';

/**
 * Replay a branch deterministically.
 *
 * Assumes:
 * - validated persistence
 * - stable eventIds
 */
export function replayBranch(branch, initialState) {
    let state = initialState;

    for (const event of branch.events) {
        state = applyEvent(state, event);
    }

    return state;
}
