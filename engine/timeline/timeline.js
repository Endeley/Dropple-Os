/**
 * Minimal timeline container for time-based intent.
 */
export function createTimeline() {
    return {
        events: [], // array of { id, time, type, payload }
    };
}
