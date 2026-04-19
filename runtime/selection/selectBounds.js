import { EventTypes } from '@/core/events/eventTypes.js';
import { getNode, getNodes } from '@/runtime/document/documentAdapter.js';
import { hitTestBounds } from '@/runtime/hitTest/hitTestBounds.js';

function intersects(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function isFiniteBounds(bounds) {
    return (
        Number.isFinite(bounds?.x) &&
        Number.isFinite(bounds?.y) &&
        Number.isFinite(bounds?.width) &&
        Number.isFinite(bounds?.height)
    );
}

function isRenderableBounds(bounds) {
    return isFiniteBounds(bounds) && (bounds.width > 0 || bounds.height > 0);
}

function normalizeBounds(bounds) {
    if (!isFiniteBounds(bounds)) return null;

    return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
    };
}

function getNodeBounds(runtime, nodeId) {
    const computedBounds = runtime?.scene?.computed?.[nodeId]?.worldBounds ?? null;
    const computedNode = runtime?.scene?.computed?.[nodeId] ?? null;
    const computedWorldBounds = normalizeBounds(computedBounds);
    const computedNodeBounds = normalizeBounds({
        x: computedNode?.x,
        y: computedNode?.y,
        width: computedNode?.width,
        height: computedNode?.height,
    });

    const node = getNode(runtime, nodeId) ?? runtime?.document?.nodes?.[nodeId] ?? null;

    const layout = node?.layout ?? {};
    const x = layout.x ?? node?.x ?? node?.props?.x ?? null;
    const y = layout.y ?? node?.y ?? node?.props?.y ?? null;
    const width = layout.width ?? node?.width ?? node?.props?.width ?? null;
    const height = layout.height ?? node?.height ?? node?.props?.height ?? null;

    const authoredBounds = normalizeBounds({ x, y, width, height });

    if (isRenderableBounds(computedWorldBounds)) return computedWorldBounds;
    if (isRenderableBounds(computedNodeBounds)) return computedNodeBounds;
    if (isRenderableBounds(authoredBounds)) return authoredBounds;

    if (computedWorldBounds) return computedWorldBounds;
    if (computedNodeBounds) return computedNodeBounds;
    if (authoredBounds) return authoredBounds;

    return null;
}

function collectSelectableNodeIds(runtime) {
    const runtimeIds = Object.keys(getNodes(runtime));
    const sceneGraphIds = Object.keys(runtime?.document?.sceneGraph?.nodes ?? {});
    const documentIds = Object.keys(runtime?.document?.nodes ?? {});

    return Array.from(new Set([...runtimeIds, ...sceneGraphIds, ...documentIds])).sort();
}

function resolveBoundsHits(runtime, rect) {
    const orderedNodeIds = collectSelectableNodeIds(runtime);
    const spatialHits = runtime?.scene?.spatialIndex
        ? hitTestBounds({ runtime, rect })
        : [];
    const spatialHitSet = new Set(spatialHits);
    const manualHitSet = new Set();

    for (const nodeId of orderedNodeIds) {
        const node = getNode(runtime, nodeId) ?? runtime?.document?.nodes?.[nodeId] ?? null;

        if (!node || node.hidden === true) continue;

        const bounds = getNodeBounds(runtime, nodeId);
        if (!bounds) continue;
        if (!intersects(bounds, rect)) continue;

        manualHitSet.add(nodeId);
    }

    return orderedNodeIds.filter((nodeId) =>
        spatialHitSet.has(nodeId) || manualHitSet.has(nodeId),
    );
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
