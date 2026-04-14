export function applyMerge({ dispatcher, events }) {
    if (!dispatcher || typeof dispatcher.dispatch !== 'function') {
        throw new Error('applyMerge: dispatcher is required');
    }

    if (!Array.isArray(events) || events.length === 0) {
        return { applied: 0 };
    }

    let applied = 0;

    for (const event of events) {
        if (!event?.type) continue;

        dispatcher.dispatch(event);
        applied += 1;
    }

    return { applied };
}
