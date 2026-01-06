// runtime/events/EventSequencer.js

/**
 * Branch-scoped event sequence manager.
 *
 * Keeps monotonic counters per branch.
 * This is runtime-only and resets on reload.
 */
export class EventSequencer {
    constructor() {
        this.counters = new Map(); // branchId → lastSeq
    }

    /**
     * Get the next sequence number for a branch.
     */
    next(branchId) {
        const prev = this.counters.get(branchId) ?? 0;
        const next = prev + 1;
        this.counters.set(branchId, next);
        return next;
    }

    /**
     * Reset counters (e.g. on document load).
     */
    reset() {
        this.counters.clear();
    }
}
