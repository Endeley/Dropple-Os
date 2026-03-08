import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeState } from '../state/runtimeState.js';

function normalizeNodeIds(payload = {}) {
    if (Array.isArray(payload.nodeIds) && payload.nodeIds.length) return payload.nodeIds;
    if (Array.isArray(payload.childIds) && payload.childIds.length) return payload.childIds;
    if (Array.isArray(payload.ids) && payload.ids.length) return payload.ids;
    if (payload.nodeId) return [payload.nodeId];
    if (payload.childId) return [payload.childId];
    return [];
}

function hasDuplicateIds(ids) {
    return new Set(ids).size !== ids.length;
}

function isDescendant(nodes, startId, targetId) {
    let currentId = startId;
    const seen = new Set();

    while (currentId) {
        if (currentId === targetId) return true;
        if (seen.has(currentId)) return true;
        seen.add(currentId);
        currentId = nodes?.[currentId]?.parentId ?? null;
    }

    return false;
}

export function applyStructureGuard(event) {
    const type = event?.type;
    if (
        type !== EventTypes.NODE_ATTACH &&
        type !== EventTypes.NODE_DETACH &&
        type !== EventTypes.NODE_REPARENT &&
        type !== EventTypes.NODE_REORDER
    ) {
        return event;
    }

    const state = getRuntimeState();
    const nodes = state?.nodes || {};
    const payload = event?.payload || {};
    const ids = normalizeNodeIds(payload);

    if (!ids.length || hasDuplicateIds(ids)) return null;
    if (ids.some((id) => !nodes[id])) return null;

    if (type === EventTypes.NODE_DETACH) {
        const canDetach = ids.every((id) => nodes[id]?.parentId);
        return canDetach ? event : null;
    }

    if (type === EventTypes.NODE_ATTACH || type === EventTypes.NODE_REPARENT) {
        const parentId = payload.parentId;
        if (!parentId || !nodes[parentId]) return null;
        if (ids.includes(parentId)) return null;

        const valid = ids.every((id) => !isDescendant(nodes, parentId, id));
        return valid ? event : null;
    }

    if (type === EventTypes.NODE_REORDER) {
        const containerId = payload.containerId ?? nodes[ids[0]]?.parentId ?? null;
        const container = containerId ? nodes[containerId] : null;
        if (!container) return null;

        const children = Array.isArray(container.children) ? container.children : [];
        if (!ids.every((id) => children.includes(id))) return null;

        return event;
    }

    return event;
}
