export function buildSelectionOverlay(context) {
    const { runtimeState, renderGraph } = context;

    const computedTransforms = runtimeState?.scene?.computed?.transforms ?? {};

    const ids = Array.from(runtimeState?.selection?.ids ?? []);

    if (!ids.length) {
        return {
            ...context,
            renderGraph: {
                ...renderGraph,
                selectionOverlay: [],
            },
        };
    }

    const nodes = renderGraph?.nodes ?? [];

    const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]));

    const selectedNodes = ids.map((id) => nodesById[id]).filter(Boolean);

    if (!selectedNodes.length) {
        return {
            ...context,
            renderGraph: {
                ...renderGraph,
                selectionOverlay: [],
            },
        };
    }

    const overlay = selectedNodes.map((node) => {
        const computed = computedTransforms[node.id];
        const t = node.transform ?? {};

        return {
            type: 'selection-box',
            id: node.id,
            bounds: {
                // ✅ 1. computed (engine truth)
                x: computed?.x ?? t.x ?? node.x ?? 0,
                y: computed?.y ?? t.y ?? node.y ?? 0,
                width: computed?.width ?? t.width ?? node.width ?? 0,
                height: computed?.height ?? t.height ?? node.height ?? 0,
            },
        };
    });

    return {
        ...context,
        renderGraph: {
            ...renderGraph,
            selectionOverlay: overlay,
        },
    };
}
