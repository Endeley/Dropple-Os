export function partitionDependencyGraph(graph, partition) {
    const scoped = new Map();
    const allowed = partition?.nodes ?? new Set();

    for (const nodeId of allowed) {
        const deps = graph.get(nodeId) || [];
        scoped.set(
            nodeId,
            deps.filter((dep) => allowed.has(dep)),
        );
    }

    return scoped;
}
