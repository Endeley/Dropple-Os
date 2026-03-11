export function propagateDirtyNodes(dirty, graph) {
    const propagated = new Set(dirty);
    const queue = [...dirty].sort();

    while (queue.length) {
        const node = queue.shift();
        const children = graph.get(node) || [];

        for (const childId of [...children].sort()) {
            if (!propagated.has(childId)) {
                propagated.add(childId);
                queue.push(childId);
            }
        }
    }

    return propagated;
}
