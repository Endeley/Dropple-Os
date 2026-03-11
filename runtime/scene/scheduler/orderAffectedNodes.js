export function orderAffectedNodes(layers, affected) {
    const ordered = [];

    for (const layer of layers) {
        for (const nodeId of layer) {
            if (affected.has(nodeId)) {
                ordered.push(nodeId);
            }
        }
    }

    return ordered;
}
