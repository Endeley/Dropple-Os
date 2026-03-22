export function emitLayoutUpdate(dispatcher, updates) {
    const dispatch =
        typeof dispatcher === 'function'
            ? dispatcher
            : dispatcher?.dispatch?.bind(dispatcher);

    if (typeof dispatch !== 'function') return null;

    const list = Array.isArray(updates) ? updates : [updates];
    const normalized = list
        .map((update) => {
            if (!update) return null;

            return {
                id: update.nodeId ?? update.id ?? null,
                x: update.x,
                y: update.y,
                width: update.width,
                height: update.height,
            };
        })
        .filter((update) => update?.id);

    if (normalized.length === 0) return null;

    return dispatch({
        type: 'node.layout.bulk',
        payload: {
            updates: normalized,
        },
    });
}
