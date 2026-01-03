export function createBranch(doc, fromBranch, newBranchId) {
    const base = doc.branches[fromBranch];

    doc.branches[newBranchId] = {
        base: fromBranch,
        events: [...base.events],
        head: base.head,
        checkpoints: base.checkpoints ? [...base.checkpoints] : [],
    };
}
