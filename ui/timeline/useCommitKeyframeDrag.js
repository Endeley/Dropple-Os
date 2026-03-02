// ui/timeline/useCommitKeyframeDrag.js

import { timelineIntentKeyframeMove } from '@/ui/timeline/timelineIntent.js';

/**
 * Commits dragged keyframes (single or group).
 *
 * 🔒 Rules:
 * - Called ONLY on pointer up
 * - Deterministic
 * - One event per keyframe
 */
export function useCommitKeyframeDrag() {
    function commitGroupDrag({ keyframeIds, trackId, deltaTime, keyframeTimesById }) {
        if (!keyframeIds || !trackId) return;

        keyframeIds.forEach((keyframeId) => {
            const originalTime = keyframeTimesById[keyframeId];
            if (typeof originalTime !== 'number') return;

            const nextTime = originalTime + deltaTime;

            timelineIntentKeyframeMove({
                keyframeId,
                trackId,
                time: nextTime,
            });
        });
    }

    return {
        commitGroupDrag,
    };
}
