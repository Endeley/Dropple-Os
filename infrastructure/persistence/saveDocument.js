// persistence/saveDocument.js

import { PERSISTENCE_VERSION } from './schema_v1.js';

/**
 * Serialize a document to persistence format (v1).
 *
 * 🔒 Rules:
 * - no derived state
 * - no runtime-only fields
 * - no previews
 */
export function saveDocument(doc) {
    if (!doc?.id) {
        throw new Error('saveDocument: invalid document');
    }

    const branches = {};

    for (const [branchId, branch] of Object.entries(doc.branches)) {
        branches[branchId] = {
            base: branch.base ?? null,
            events: [...branch.events],
            head: branch.head ?? null,
            checkpoints: [...branch.checkpoints],
        };
    }

    return {
        version: PERSISTENCE_VERSION,
        docId: doc.id,
        currentBranch: doc.currentBranch,
        branches,
    };
}
