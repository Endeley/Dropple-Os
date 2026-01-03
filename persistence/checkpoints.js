export function createCheckpoint(state, uptoEventId) {
    return {
        eventId: uptoEventId,
        snapshot: state,
    };
}
