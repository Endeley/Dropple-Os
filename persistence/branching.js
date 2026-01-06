/**
 * Create a new branch from an existing branch.
 *
 * NOTE:
 * - Does NOT generate IDs
 * - Branch ID must be provided explicitly
 */
export function createBranch(doc, fromBranch, newBranchId) {
    if (!doc.branches[fromBranch]) {
        throw new Error(`createBranch: base branch "${fromBranch}" does not exist`);
    }

    if (!newBranchId) {
        throw new Error('createBranch: newBranchId is required');
    }

    const base = doc.branches[fromBranch];

    doc.branches[newBranchId] = {
        base: fromBranch,
        events: [...base.events],
        head: base.head,
        checkpoints: base.checkpoints ? [...base.checkpoints] : [],
    };
}
