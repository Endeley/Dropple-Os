/**
 * Flattens timeline events into reducer-friendly events up to a given time.
 * Deterministic, replay-safe. Does not mutate input.
 */
export function flattenTimeline({ timeline, upToTime = Infinity }) {
    if (!timeline?.events) return [];

    return timeline.events
        .filter((evt) => evt.time <= upToTime)
        .filter(isCommitEvent)
        .sort((a, b) => a.time - b.time)
        .map(toReducerEvent);
}

function isCommitEvent(evt) {
    const t = evt.type || '';
    return (
        t.startsWith('node/') ||
        t.startsWith('layout/') ||
        t.startsWith('state/') ||
        t.startsWith('component/')
    );
}

function toReducerEvent(evt) {
    return {
        type: evt.type,
        payload: evt.payload,
        meta: {
            fromTimeline: true,
            time: evt.time,
            timelineEventId: evt.id,
        },
    };
}
