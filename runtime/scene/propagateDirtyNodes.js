export function propagateDirtyNodes(dirty, graph) {
    const propagated = new Set(dirty);
    const reverse = new Map();

    for (const [node, deps] of graph.entries()) {
        for (const dep of deps) {
            if (!reverse.has(dep)) {
                reverse.set(dep, []);
            }
            reverse.get(dep).push(node);
        }
    }

    const queue = [...dirty].sort();

    while (queue.length) {
        const node = queue.shift();
        const dependents = reverse.get(node) || [];

        for (const dep of dependents.sort()) {
            if (!propagated.has(dep)) {
                propagated.add(dep);
                queue.push(dep);
            }
        }
    }

    return propagated;
}
