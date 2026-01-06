// runtime/events/createEventId.js

/**
 * Canonical eventId generator.
 *
 * eventId shape:
 *   `${branchId}:${seq}`
 *
 * 🔒 ID POLICY (Phase 8):
 * - Monotonic per branch
 * - Deterministic
 * - No randomness
 */
export function createEventId({ branchId, nextSeq }) {
    if (!branchId) {
        throw new Error('createEventId: branchId is required');
    }

    if (typeof nextSeq !== 'number') {
        throw new Error('createEventId: nextSeq must be a number');
    }

    return `${branchId}:${nextSeq}`;
}
