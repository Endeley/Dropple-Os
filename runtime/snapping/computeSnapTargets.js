export function computeSnapTargets(sceneComputed, excludedIds = []) {
    const excluded = new Set(excludedIds);
    const targets = [];

    for (const node of Object.values(sceneComputed ?? {})) {
        if (!node?.id || excluded.has(node.id) || !node.worldBounds) continue;

        const b = node.worldBounds;

        targets.push(
            { type: 'v', x: b.x, nodeId: node.id },
            { type: 'v', x: b.x + b.width / 2, nodeId: node.id },
            { type: 'v', x: b.x + b.width, nodeId: node.id },
            { type: 'h', y: b.y, nodeId: node.id },
            { type: 'h', y: b.y + b.height / 2, nodeId: node.id },
            { type: 'h', y: b.y + b.height, nodeId: node.id },
        );
    }

    return targets;
}
