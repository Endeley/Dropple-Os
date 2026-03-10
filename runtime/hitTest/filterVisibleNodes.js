export function filterVisibleNodes(runtime, nodeIds) {
    const nodes =
        runtime?.document?.nodes ||
        runtime?.document?.sceneGraph?.nodes ||
        runtime?.nodes ||
        {};

    const visible = [];

    for (const id of nodeIds || []) {
        const node = nodes[id];
        if (!node) continue;
        if (node.hidden === true) continue;

        visible.push(id);
    }

    return visible;
}
