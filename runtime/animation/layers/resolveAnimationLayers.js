export function resolveAnimationLayers({
    timeline = [],
    stateMachine = [],
    graph = [],
    choreography = [],
} = {}) {
    const resolved = [];

    for (const layer of timeline) {
        if (!layer) continue;
        resolved.push({
            ...layer,
            intent: 'base',
            priority: 0,
        });
    }

    for (const layer of choreography) {
        if (!layer) continue;
        resolved.push({
            ...layer,
            intent: 'base',
            priority: 0,
        });
    }

    for (const layer of stateMachine) {
        if (!layer) continue;
        resolved.push({
            ...layer,
            intent: 'override',
            priority: 1,
        });
    }

    for (const layer of graph) {
        if (!layer) continue;
        resolved.push({
            ...layer,
            intent: 'modifier',
            priority: 2,
            mode: layer.mode ?? 'add',
        });
    }

    return resolved;
}
