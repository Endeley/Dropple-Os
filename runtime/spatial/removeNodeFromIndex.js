export function removeNodeFromIndex(index, nodeId) {
    if (!index || !nodeId) return;

    const cells = index.nodeCells.get(nodeId);

    if (cells) {
        for (const key of cells) {
            const bucket = index.cells.get(key);
            if (!bucket) continue;

            bucket.delete(nodeId);

            if (bucket.size === 0) {
                index.cells.delete(key);
            }
        }
    }

    index.nodeCells.delete(nodeId);
    index.nodeBounds.delete(nodeId);
}
