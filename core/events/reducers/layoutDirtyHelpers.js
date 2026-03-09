function normalizeNodeIds(nodeIds) {
    if (!Array.isArray(nodeIds)) return [];
    return nodeIds.filter(Boolean);
}

export function markLayoutDirty(state, { nodeIds = [], fullPass = false } = {}) {
    const document = state?.document;
    const layout = document?.layout;
    if (!document || !layout) {
        return state;
    }

    const prevDirty = layout.dirty ?? {
        nodeIds: [],
        fullPass: false,
        revision: 0,
    };

    const nextNodeIds = fullPass
        ? []
        : Array.from(new Set([
              ...normalizeNodeIds(prevDirty.nodeIds),
              ...normalizeNodeIds(nodeIds),
          ]));

    return {
        ...state,
        document: {
            ...document,
            layout: {
                ...layout,
                dirty: {
                    nodeIds: nextNodeIds,
                    fullPass: prevDirty.fullPass || fullPass,
                    revision: (prevDirty.revision ?? 0) + 1,
                },
            },
        },
    };
}
