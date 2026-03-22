export function projectGroupTransform(runtime) {
    const group = runtime?.interaction?.drag?.group ?? null;

    if (!group?.active || !group?.bounds) {
        return null;
    }

    return Object.freeze({
        bounds: Object.freeze({
            ...group.bounds,
            center: group.bounds?.center
                ? Object.freeze({ ...group.bounds.center })
                : null,
        }),
        nodeIds: Object.freeze([...(group.nodeIds ?? [])]),
    });
}
