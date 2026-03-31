import { EventTypes } from '@/core/events/eventTypes.js';

function intersects(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function getNodeBounds(runtime, nodeId) {
    const computedBounds = runtime?.scene?.computed?.[nodeId]?.worldBounds ?? null;
    if (
        Number.isFinite(computedBounds?.x) &&
        Number.isFinite(computedBounds?.y) &&
        Number.isFinite(computedBounds?.width) &&
        Number.isFinite(computedBounds?.height)
    ) {
        return {
            x: computedBounds.x,
            y: computedBounds.y,
            width: computedBounds.width,
            height: computedBounds.height,
        };
    }

    const node =
        runtime?.nodes?.[nodeId] ??
        runtime?.document?.sceneGraph?.nodes?.[nodeId] ??
        runtime?.document?.nodes?.[nodeId] ??
        null;

    const layout = node?.layout ?? {};
    const x = layout.x ?? node?.x ?? node?.props?.x ?? null;
    const y = layout.y ?? node?.y ?? node?.props?.y ?? null;
    const width = layout.width ?? node?.width ?? node?.props?.width ?? null;
    const height = layout.height ?? node?.height ?? node?.props?.height ?? null;

    if (
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        Number.isFinite(width) &&
        Number.isFinite(height)
    ) {
        return { x, y, width, height };
    }

    return null;
}

function collectSelectableNodeIds(runtime) {
    const runtimeIds = Object.keys(runtime?.nodes ?? {});
    const sceneGraphIds = Object.keys(runtime?.document?.sceneGraph?.nodes ?? {});
    const documentIds = Object.keys(runtime?.document?.nodes ?? {});

    return Array.from(new Set([...runtimeIds, ...sceneGraphIds, ...documentIds])).sort();
}

function resolveBoundsHits(runtime, rect) {
    const hits = [];

    for (const nodeId of collectSelectableNodeIds(runtime)) {
        const node =
            runtime?.nodes?.[nodeId] ??
            runtime?.document?.sceneGraph?.nodes?.[nodeId] ??
            runtime?.document?.nodes?.[nodeId] ??
            null;

        if (!node || node.hidden === true) continue;

        const bounds = getNodeBounds(runtime, nodeId);
        if (!bounds) continue;
        if (!intersects(bounds, rect)) continue;

        hits.push(nodeId);
    }

    return hits;
}

export function resolveBoundsSelection(runtime, bounds, options = {}) {
    const additive = options?.additive === true;
    const existingIds = Array.isArray(options?.existingIds) ? options.existingIds : [];
    const hitIds = resolveBoundsHits(runtime, bounds);
    const ids = additive
        ? Array.from(new Set([...existingIds, ...hitIds]))
        : hitIds;

    return {
        ids,
        primary: ids[0] ?? null,
        hitIds,
    };
}

export function selectBounds(runtime, bounds, options = {}) {
    const selection = resolveBoundsSelection(runtime, bounds, options);

    return {
        type: EventTypes.SELECTION_SET,
        payload: {
            ids: selection.ids,
            primary: selection.primary,
        },
    };
}
