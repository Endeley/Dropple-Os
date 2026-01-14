import { applyEvent } from '@/core/events/applyEvent.js';
import { withReplayGuard } from '@/runtime/replay/withReplayGuard.js';

/**
 * Replay a branch deterministically.
 *
 * Assumes:
 * - validated persistence
 * - stable eventIds
 */
export function replayBranch(branch, initialState) {
    return withReplayGuard(() => {
        let state = initialState;

        for (const event of branch.events) {
            state = applyEvent(state, event);
        }

        return state;
    });
}
