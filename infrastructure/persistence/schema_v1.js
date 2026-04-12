/**
 * Persistence schema v1 validator.
 *
 * 🔒 Guarantees:
 * - version correctness
 * - structural integrity
 * - minimum required fields
 */

export const PERSISTENCE_VERSION = 1;

export function validatePersistenceV1(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Persistence: invalid root object');
    }

    if (data.version !== PERSISTENCE_VERSION) {
        throw new Error(`Persistence: unsupported version ${data.version}`);
    }

    if (!data.docId || typeof data.docId !== 'string') {
        throw new Error('Persistence: docId is required');
    }

    if (!data.currentBranch || typeof data.currentBranch !== 'string') {
        throw new Error('Persistence: currentBranch is required');
    }

    if (!data.branches || typeof data.branches !== 'object') {
        throw new Error('Persistence: branches must be an object');
    }

    for (const [branchId, branch] of Object.entries(data.branches)) {
        if (!branch) {
            throw new Error(`Persistence: branch "${branchId}" is invalid`);
        }

        if (!Array.isArray(branch.events)) {
            throw new Error(`Persistence: branch "${branchId}" events must be an array`);
        }

        if (!Array.isArray(branch.checkpoints)) {
            throw new Error(`Persistence: branch "${branchId}" checkpoints must be an array`);
        }
    }

    return true;
}
