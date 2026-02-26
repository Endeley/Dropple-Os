import { normalizeTimeline, hashTimeline } from '../../domain/timeline/TimelineContract.js';

export function createTimelineHistory(initialTimeline) {
    const normalized = normalizeTimeline(initialTimeline);
    const hash = hashTimeline(normalized);

    return {
        past: [],
        present: normalized,
        future: [],
        presentHash: hash,
    };
}

export function applyTimelineMutation(history, nextTimeline) {
    const normalized = normalizeTimeline(nextTimeline);
    const nextHash = hashTimeline(normalized);

    if (nextHash === history.presentHash) {
        return history;
    }

    return {
        past: [...history.past, history.present],
        present: normalized,
        future: [],
        presentHash: nextHash,
    };
}

export function undo(history) {
    if (history.past.length === 0) return history;

    const previous = history.past[history.past.length - 1];

    return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
        presentHash: hashTimeline(previous),
    };
}

export function redo(history) {
    if (history.future.length === 0) return history;

    const next = history.future[0];

    return {
        past: [...history.past, history.present],
        present: next,
        future: history.future.slice(1),
        presentHash: hashTimeline(next),
    };
}
