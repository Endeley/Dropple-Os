export function filterConflicts(orderedEvents) {
    const seen = new Set();
    const result = [];

    for (let i = orderedEvents.length - 1; i >= 0; i--) {
        const evt = orderedEvents[i];
        const key = conflictKey(evt);

        if (key && seen.has(key)) {
            continue; // overridden
        }

        if (key) seen.add(key);
        result.unshift(evt);
    }

    return result;
}

function conflictKey(evt) {
    const id = evt.payload?.id;
    if (!id) return null;

    if (evt.type.startsWith('node/')) {
        return `${evt.type}:${id}`;
    }

    return null;
}
