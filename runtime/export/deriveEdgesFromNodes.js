export function deriveEdgesFromNodes(nodes) {
    const list = Array.isArray(nodes) ? nodes : Object.values(nodes || {});
    const edges = [];

    for (const n of list) {
        if (n?.parentId) {
            edges.push({ from: n.parentId, to: n.id, type: 'parent' });
        }
        if (Array.isArray(n?.references)) {
            for (const ref of n.references) {
                edges.push({ from: n.id, to: ref, type: 'reference' });
            }
        }
    }

    return edges;
}
