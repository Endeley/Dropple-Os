export function frontierSchedule({
    dirtyNodes,
    graph,
    allowedNodes,
}) {
    const queue = [...dirtyNodes]
        .filter((nodeId) => !allowedNodes || allowedNodes.has(nodeId))
        .sort();
    const visited = new Set();
    const affected = new Set();

    while (queue.length) {
        const nodeId = queue.shift();

        if (visited.has(nodeId)) continue;
        visited.add(nodeId);

        if (allowedNodes && !allowedNodes.has(nodeId)) {
            continue;
        }

        affected.add(nodeId);

        const children = graph.get(nodeId) || [];

        for (const childId of [...children].sort()) {
            if (!visited.has(childId)) {
                queue.push(childId);
            }
        }
    }

    return affected;
}
