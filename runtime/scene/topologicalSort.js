export function topologicalSort(graph) {
    const visited = new Set();
    const result = [];
    const nodes = [...graph.keys()].sort();

    function visit(node) {
        if (visited.has(node)) return;

        visited.add(node);

        const deps = graph.get(node) || [];
        for (const dep of deps) {
            visit(dep);
        }

        result.push(node);
    }

    for (const node of nodes) {
        visit(node);
    }

    return result;
}
