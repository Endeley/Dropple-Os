/**
 * messageBusPersistence — Phase 2.4
 *
 * Purpose:
 * - Attach persistence hooks to MessageBus
 * - Capture ALL emitted events
 * - Store per-run message timeline
 *
 * NOTES:
 * - In-memory reference implementation
 * - Replace storage later (DB, Convex, Redis, etc)
 * - ZERO coupling to MessageBus internals
 */

const messageStore = new Map();

/**
 * Attach persistence to a MessageBus instance
 *
 * @param {MessageBus} bus
 * @param {Object} options
 * @param {string} options.runId
 */
export function attachMessageBusPersistence(bus, { runId }) {
    if (!bus || !runId) {
        throw new Error('attachMessageBusPersistence requires bus + runId');
    }

    // Init run storage
    if (!messageStore.has(runId)) {
        messageStore.set(runId, []);
    }

    // Subscribe to all future messages
    const unsubscribe = bus.subscribe((event) => {
        messageStore.get(runId).push(event);
    });

    return {
        unsubscribe,

        getMessages() {
            return [...(messageStore.get(runId) || [])];
        },
    };
}

/* ---------------------------------------------
   Read API (Replay / Timeline / Debug)
--------------------------------------------- */

export function getRunMessages(runId) {
    return messageStore.get(runId) || [];
}

export function clearRunMessages(runId) {
    messageStore.delete(runId);
}

export function listRunsWithMessages() {
    return Array.from(messageStore.keys());
}
