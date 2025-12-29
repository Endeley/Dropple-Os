/**
 * Wraps an intent event with collaboration metadata.
 */
export function createEventEnvelope({ id, type, payload, meta }) {
    return {
        id,
        type,
        payload,
        meta,
    };
}
