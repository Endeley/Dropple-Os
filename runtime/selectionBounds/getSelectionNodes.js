export function getSelectionNodes(runtime) {
    const ids = runtime?.selection?.ids ?? new Set();
    const computed = runtime?.scene?.computed ?? {};
    const nodes = [];

    for (const id of ids) {
        const node = computed[id];
        if (node) {
            nodes.push(node);
        }
    }

    return nodes;
}
