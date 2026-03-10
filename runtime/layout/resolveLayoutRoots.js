export function resolveLayoutRoots(dirtyNodes, layoutRootIndex) {
    const roots = new Set();

    for (const nodeId of dirtyNodes || []) {
        const root = layoutRootIndex?.get?.(nodeId);
        if (root) {
            roots.add(root);
        }
    }

    return [...roots].sort();
}
