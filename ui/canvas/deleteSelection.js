import { EventTypes } from '@/core/events/eventTypes.js';

function normalizeDeleteIds(ids = []) {
    return Array.from(
        new Set(
            (Array.isArray(ids) ? ids : [])
                .filter((id) => typeof id === 'string' && id.trim().length > 0),
        ),
    );
}

export function dispatchNodeDeleteSelection({ ids = [], dispatchEvent } = {}) {
    if (typeof dispatchEvent !== 'function') return;

    normalizeDeleteIds(ids).forEach((id) => {
        dispatchEvent({
            type: EventTypes.NODE_DELETE,
            payload: { id },
        });
    });
}

