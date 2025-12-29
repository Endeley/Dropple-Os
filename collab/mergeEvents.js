export function mergeEvents(events) {
    return events.slice().sort((a, b) => {
        if (a.meta.clock !== b.meta.clock) {
            return a.meta.clock - b.meta.clock;
        }

        // deterministic tie-break
        if (a.meta.userId !== b.meta.userId) {
            return a.meta.userId < b.meta.userId ? -1 : 1;
        }

        return a.id < b.id ? -1 : 1;
    });
}
