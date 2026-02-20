import { replayBranch } from '@/persistence/replay.js';
import { computeReplaySlice } from '@/timeline/computeReplaySlice.js';

/**
 * Infrastructure projection: compose persistence replay + core slice computation.
 */
export function projectStateAtTime({ branch, time, checkpoints = [] }) {
    const { baseState, events } = computeReplaySlice({
        branch,
        time,
        checkpoints,
    });

    return replayBranch({ events }, baseState);
}
