import { replayBranch } from '@/runtime/replay/replayBranch.js';
import { computeReplaySlice } from '@/timeline/computeReplaySlice.js';

/**
 * Projects state at a given time by replaying events up to that time.
 * Runtime projection helper.
 */
export function projectStateAtTime({ branch, time, checkpoints = [], dispatcher }) {
    const { baseState, events } = computeReplaySlice({
        branch,
        time,
        checkpoints,
    });

    return replayBranch({ events }, baseState, { dispatcher });
}
