// ==============================
// Document & Branch Construction
// ==============================

// NOTE:
// - This file MUST NOT generate durable IDs implicitly
// - All IDs are passed in from the creation boundary
// - This enforces the Canonical ID Policy (Phase 8)

/**
 * Create a new document container.
 *
 * @param {Object} params
 * @param {string} params.docId - Stable, opaque document ID (REQUIRED)
 */
export function createDocument({ docId }) {
    if (!docId) {
        throw new Error('createDocument: docId is required');
    }

    return {
        id: docId,

        branches: {
            main: {
                base: null, // parent branch
                events: [], // event log
                head: null, // last eventId
                checkpoints: [], // snapshot checkpoints
            },
        },

        currentBranch: 'main',
    };
}
