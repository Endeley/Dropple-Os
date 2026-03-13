const registry = new Map();

export function registerNavigationGraph(graph) {
    if (!graph?.id) {
        throw new Error('Navigation graph requires id');
    }

    registry.set(graph.id, graph);
}

export function getNavigationGraph(id) {
    return registry.get(id);
}

export function getAllNavigationGraphs() {
    return Array.from(registry.values());
}

export function clearNavigationGraphs() {
    registry.clear();
}
