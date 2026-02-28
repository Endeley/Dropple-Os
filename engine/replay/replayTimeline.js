import { dispatchTrack } from '../timeline/timelineController.js';

/**
 * Pure deterministic timeline replay.
 */
export function replayTimeline({ controller, events = [] }) {
    let current = controller;

    for (const evt of events) {
        current = dispatchTrack(current, evt);
    }

    return current;
}
