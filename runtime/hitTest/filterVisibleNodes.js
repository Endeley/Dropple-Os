export function filterVisibleNodes(runtime, nodeIds) {
    const documentNodes = runtime?.document?.nodes ?? null;
    const sceneGraphNodes = runtime?.document?.sceneGraph?.nodes ?? null;
    const runtimeNodes = runtime?.nodes ?? null;

    const visible = [];

    for (const id of nodeIds || []) {
        const node = documentNodes?.[id] ?? sceneGraphNodes?.[id] ?? runtimeNodes?.[id] ?? null;
        if (!node) continue;
        if (node.hidden === true) continue;

        visible.push(id);
    }

    return visible;
}
