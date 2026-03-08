/**
 * Create a checkpoint snapshot.
 *
 * NOTE:
 * - Does NOT generate IDs
 * - eventId must already exist
 */
export function createCheckpoint(state, uptoEventId) {
    if (uptoEventId == null) {
        throw new Error('createCheckpoint: uptoEventId is required');
    }

    return {
        eventId: uptoEventId,
        snapshot: state,
    };
}
