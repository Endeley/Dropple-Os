import { insertNodeIntoIndex } from './insertNodeIntoIndex.js';

export function normalizeSpatialBounds(bounds) {
    if (!bounds) return null;

    const x = Number(bounds.x);
    const y = Number(bounds.y);
    const width = Number(bounds.width);
    const height = Number(bounds.height);

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
        return null;
    }

    return {
        x,
        y,
        width: Math.max(0, width),
        height: Math.max(0, height),
    };
}

export function resolveSpatialBoundsFromComputed(computed) {
    if (!computed) return null;

    return normalizeSpatialBounds(
        computed.worldBounds ?? {
            x: computed.x ?? 0,
            y: computed.y ?? 0,
            width: computed.width ?? 0,
            height: computed.height ?? 0,
        },
    );
}

export function indexNodeBounds(index, nodeId, bounds) {
    const normalized = normalizeSpatialBounds(bounds);
    if (!normalized) return;
    insertNodeIntoIndex(index, nodeId, normalized);
}

export function indexComputedNodeBounds(index, nodeId, computed) {
    const normalized = resolveSpatialBoundsFromComputed(computed);
    if (!normalized) return;
    insertNodeIntoIndex(index, nodeId, normalized);
}
