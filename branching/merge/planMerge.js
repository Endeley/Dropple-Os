import { EventTypes } from '@/core/events/eventTypes.js';

function buildNodeCreatePayload(entry) {
    const after = entry?.after;
    if (!entry?.nodeId || !after || typeof after !== 'object') return null;

    return {
        node: {
            id: entry.nodeId,
            ...after,
        },
    };
}

function buildNodeDeletePayload(entry) {
    if (!entry?.nodeId) return null;

    return {
        id: entry.nodeId,
    };
}

function buildNodeUpdatePayload(entry) {
    const after = entry?.after;
    if (!entry?.nodeId || !after || typeof after !== 'object') return null;

    const patch = {};

    if ('layout' in after) {
        patch.layout = after.layout;
    }

    if ('layoutChild' in after) {
        patch.layoutChild = after.layoutChild;
    }

    if (Object.keys(patch).length === 0) {
        return null;
    }

    return {
        id: entry.nodeId,
        patch,
    };
}

export function planMerge(diff) {
    if (!diff) return [];

    const events = [];

    for (const entry of diff.added ?? []) {
        const payload = buildNodeCreatePayload(entry);
        if (!payload) continue;

        events.push({
            type: EventTypes.NODE_CREATE,
            payload,
        });
    }

    for (const entry of diff.removed ?? []) {
        const payload = buildNodeDeletePayload(entry);
        if (!payload) continue;

        events.push({
            type: EventTypes.NODE_DELETE,
            payload,
        });
    }

    for (const entry of diff.updated ?? []) {
        const payload = buildNodeUpdatePayload(entry);
        if (!payload) continue;

        events.push({
            type: EventTypes.NODE_UPDATE,
            payload,
        });
    }

    return events;
}
