import { hitTestBounds } from '@/runtime/hitTest/hitTestBounds.js';
import { EventTypes } from '@/core/events/eventTypes.js';

export function selectBounds(runtime, bounds) {
    const hits = hitTestBounds({
        runtime,
        rect: bounds,
    });
    const ids = hits.map((hit) => (typeof hit === 'string' ? hit : hit?.id)).filter(Boolean);

    return {
        type: EventTypes.SELECTION_SET,
        payload: {
            ids,
            primary: ids[0] ?? null,
        },
    };
}
