// persistence/loadDocument.js

import { validatePersistenceV1 } from './schema_v1.js';
import { createDocument } from './documentSchema.js';

/**
 * Load a persisted document safely.
 *
 * 🔒 Phase 8.3 rules:
 * - validate schema
 * - never auto-fix silently
 * - never regenerate IDs
 */
export function loadDocument(persisted) {
    validatePersistenceV1(persisted);

    const doc = createDocument({ docId: persisted.docId });

    doc.currentBranch = persisted.currentBranch;

    for (const [branchId, branch] of Object.entries(persisted.branches)) {
        doc.branches[branchId] = {
            base: branch.base ?? null,
            events: [...branch.events],
            head: branch.head ?? null,
            checkpoints: [...branch.checkpoints],
        };
    }

    return doc;
}
