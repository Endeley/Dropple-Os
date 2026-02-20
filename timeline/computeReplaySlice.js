/**
 * Compute replay slice (baseState + events) for a given time.
 * Pure, deterministic, no runtime/persistence imports.
 */
export function computeReplaySlice({ branch, time, checkpoints = [] }) {
    let baseState = undefined;
    let startIndex = 0;

    for (let i = checkpoints.length - 1; i >= 0; i--) {
        if (checkpoints[i].time <= time) {
            baseState = checkpoints[i].snapshot;
            startIndex = checkpoints[i].eventIndex;
            break;
        }
    }

    const events = (branch?.events || []).filter(
        (evt, i) => i >= startIndex && (evt.meta?.time ?? Infinity) <= time
    );

    return { baseState, events };
}
