function compareNullableStrings(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''));
}

export function resolveEventOrder(events = []) {
    return events
        .map((event, index) => ({ event, index }))
        .sort((left, right) => {
            const leftTimestamp = Number.isFinite(left.event?.timestamp) ? left.event.timestamp : Number.MAX_SAFE_INTEGER;
            const rightTimestamp = Number.isFinite(right.event?.timestamp) ? right.event.timestamp : Number.MAX_SAFE_INTEGER;

            if (leftTimestamp !== rightTimestamp) {
                return leftTimestamp - rightTimestamp;
            }

            const byId = compareNullableStrings(left.event?.id, right.event?.id);
            if (byId !== 0) {
                return byId;
            }

            const bySource = compareNullableStrings(left.event?.meta?.sourcePeerId, right.event?.meta?.sourcePeerId);
            if (bySource !== 0) {
                return bySource;
            }

            return left.index - right.index;
        })
        .map(({ event }) => event);
}
