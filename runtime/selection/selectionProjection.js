export function selectionProjection(runtime) {
    const ids = Object.freeze(Array.from(runtime?.selection?.ids ?? []));

    return Object.freeze({
        ids,
        primary: runtime?.selection?.primary ?? null,
        count: ids.length,
    });
}
