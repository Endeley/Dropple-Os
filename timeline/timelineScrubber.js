import { projectStateAtTime } from './timelineProjection.js';
import { useTimelineCursor } from './timelineCursor.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

/**
 * Read-only scrubbing: sets cursor time and fills animated store with preview nodes/rootIds.
 * Does not mutate runtime state.
 */
export function scrubToTime({ doc, branchId, time }) {
    const branch = doc.branches[branchId];
    const checkpoints = branch?.checkpoints || [];

    const previewState = projectStateAtTime({
        branch,
        checkpoints,
        time,
    });

    useTimelineCursor.getState().setTime(time);

    useAnimatedRuntimeStore.setState(
        {
            nodes: previewState.nodes,
            rootIds: previewState.rootIds,
        },
        false
    );
}
