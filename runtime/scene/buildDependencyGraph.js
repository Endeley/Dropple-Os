export function buildDependencyGraph(document) {
    const graph = new Map();
    const nodes = document?.sceneGraph?.nodes || {};
    const sortedIds = Object.keys(nodes).sort();

    for (const id of sortedIds) {
        const node = nodes[id];
        const deps = [];
        const children = Array.isArray(node?.children)
            ? [...node.children].sort()
            : [];

        for (const childId of children) {
            deps.push(childId);
        }

        graph.set(id, deps);
    }

    return graph;
}
