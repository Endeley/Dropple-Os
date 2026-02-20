import { applyEvent } from '@/core/events/applyEvent.js';
import { withMutationOrigin } from '@/core/mutationContext.js';

/**
 * Deterministic, side-effect-free replay through the canonical reducer path.
 * Runs inside dispatcher layer to respect mutation funnel rules.
 */
export function replayEvents({ events = [], initialState = undefined, onEvent } = {}) {
    return withMutationOrigin('dispatcher', () => {
        let state = initialState;

        for (const event of events) {
            if (!event) continue;
            state = applyEvent(state, event);

            if (typeof onEvent === 'function') {
                const next = onEvent(state, event);
                if (next !== undefined) {
                    state = next;
                }
            }
        }

        return state;
    });
}
