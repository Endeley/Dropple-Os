import { getRuntimeSnapshot, getWorkspaceProjection } from '@/runtime/projection';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAutoKeyframeStore } from '@/runtime/stores/useAutoKeyframeStore.js';
import { commitTimelineKeyframe } from '@/runtime/timeline/commitTimelineKeyframe';
import { isAutoLayoutChild } from '@/runtime/layout/index.js';
import { createSessionCommitActions } from '@/runtime/input/sessionCommitRuntimeBridge.js';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';

function canAuthorAnimationKeyframes() {
    const runtimeState = getRuntimeSnapshot();
    if (runtimeState?.isReplaying) return false;

    const workspaceId = getWorkspaceProjection()?.id ?? 'graphic';
    const activation = getWorkspaceActivation(workspaceId);
    if (!activation?.capabilities?.has('timeline')) return false;

    return true;
}

export function createSessionCommitBridgeActions(event) {
    const runtimeState = getRuntimeSnapshot();
    const nodesById = runtimeState?.nodes || {};
    const selectedIds = useRuntimeStore.getState().selection?.ids || [];
    const frameTime = useRuntimeStore.getState().frameTime;
    const autoKeyframeEnabled = useAutoKeyframeStore.getState()?.enabled;

    return createSessionCommitActions({
        event,
        context: {
            nodesById,
            selectedIds,
            frameTime,
            autoKeyframeEnabled,
            canAuthorAnimationKeyframes: canAuthorAnimationKeyframes(),
            isAutoLayoutChild,
        },
    });
}

export function commitBridgeTimelineKeyframe(dispatch, entry) {
    return commitTimelineKeyframe({
        dispatcher: { dispatch },
        nodeId: entry.nodeId,
        trackId: entry.trackId,
        time: entry.time,
        property: entry.property,
        value: entry.value,
    });
}
