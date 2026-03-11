export function buildEvaluationLayers(graph) {
    const inDegree = new Map();
    const layers = [];
    const nodes = [...graph.keys()].sort();

    for (const node of nodes) {
        inDegree.set(node, 0);
    }

    for (const [, deps] of graph.entries()) {
        for (const dep of deps) {
            inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
    }

    let currentLayer = nodes.filter((nodeId) => (inDegree.get(nodeId) || 0) === 0);

    while (currentLayer.length > 0) {
        const stableLayer = [...currentLayer].sort();
        layers.push(stableLayer);

        const nextLayer = [];

        for (const nodeId of stableLayer) {
            const deps = graph.get(nodeId) || [];

            for (const dep of [...deps].sort()) {
                const nextDegree = (inDegree.get(dep) || 0) - 1;
                inDegree.set(dep, nextDegree);

                if (nextDegree === 0) {
                    nextLayer.push(dep);
                }
            }
        }

        currentLayer = nextLayer;
    }

    return layers;
}
