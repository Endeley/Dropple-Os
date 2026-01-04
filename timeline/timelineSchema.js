/**
 * Timeline schema (read-only for now)
 * Stored separately from runtime state.
 */
export function createTimeline() {
    return {
        duration: 2000, // ms
        tracks: {}, // trackId → track
    };
}
