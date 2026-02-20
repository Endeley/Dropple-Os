import { replayBranch } from '@/persistence/replay.js';
import { computeReplaySlice } from '@/timeline/computeReplaySlice.js';

/**
 * Projects state at a given time by replaying events up to that time.
 * Infrastructure preview helper (uses persistence replay).
 */
export function projectStateAtTime({ branch, time, checkpoints = [] }) {
    const { baseState, events } = computeReplaySlice({
        branch,
        time,
        checkpoints,
    });

    return replayBranch({ events }, baseState);
}
