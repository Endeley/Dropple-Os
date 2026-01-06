// timeline/ui/useCommitKeyframeDrag.js

import { EventTypes } from '@/core/events/eventTypes';

/**
 * Commits dragged keyframes (single or group).
 *
 * 🔒 Rules:
 * - Called ONLY on pointer up
 * - Deterministic
 * - One event per keyframe
 */
export function useCommitKeyframeDrag({ dispatcher }) {
    if (!dispatcher) {
        throw new Error('useCommitKeyframeDrag: dispatcher is required');
    }

    function commitGroupDrag({ keyframeIds, trackId, deltaTime, keyframeTimesById }) {
        if (!keyframeIds || !trackId) return;

        keyframeIds.forEach((keyframeId) => {
            const originalTime = keyframeTimesById[keyframeId];
            if (typeof originalTime !== 'number') return;

            const nextTime = originalTime + deltaTime;

            dispatcher.dispatch({
                type: EventTypes.TIMELINE_KEYFRAME_MOVE,
                payload: {
                    keyframeId,
                    trackId,
                    time: nextTime,
                },
            });
        });
    }

    return {
        commitGroupDrag,
    };
}
