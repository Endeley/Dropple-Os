import { replayBranch } from '@/persistence/replay.js';
import { applyEvent } from '@/core/events/applyEvent.js';

/**
 * Projects state at a given time by replaying events up to that time.
 * Pure, deterministic, UI-agnostic.
 */
export function projectStateAtTime({ branch, time, checkpoints = [] }) {
    let baseState = undefined;
    let startIndex = 0;

    for (let i = checkpoints.length - 1; i >= 0; i--) {
        if (checkpoints[i].time <= time) {
            baseState = checkpoints[i].snapshot;
            startIndex = checkpoints[i].eventIndex;
            break;
        }
    }

    const sliced = {
        events: branch.events.filter((evt, i) => i >= startIndex && (evt.meta?.time ?? Infinity) <= time),
    };

    return replayBranch(sliced, applyEvent, baseState);
}
