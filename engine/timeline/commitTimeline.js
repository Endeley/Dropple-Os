import { flattenTimeline } from './flattenTimeline.js';

/**
 * Commits timeline events up to a given time through the dispatcher.
 * Events become authoritative reducer events, enter history, and support undo/redo.
 */
export function commitTimeline({ timeline, dispatcher, upToTime = Infinity }) {
    const events = flattenTimeline({ timeline, upToTime });
    events.forEach((evt) => {
        dispatcher.dispatch(evt);
    });
    return events.length;
}
