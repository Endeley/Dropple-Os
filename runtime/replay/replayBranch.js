import { replayBranch as replayBranchPure } from '@/persistence/replay.js';
import { withReplayGuard } from '@/runtime/replay/withReplayGuard.js';

export function replayBranch(branch, initialState) {
    return withReplayGuard(() => replayBranchPure(branch, initialState));
}
