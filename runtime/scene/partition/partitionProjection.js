export function partitionProjection(scene) {
    const partitions = scene?.partitions;

    if (!(partitions instanceof Map)) {
        return Object.freeze({
            count: 0,
            ids: Object.freeze([]),
        });
    }

    const ids = [...partitions.keys()].sort();

    return Object.freeze({
        count: ids.length,
        ids: Object.freeze(ids),
    });
}
