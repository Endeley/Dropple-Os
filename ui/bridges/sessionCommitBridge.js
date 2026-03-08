import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeSnapshot, getWorkspaceProjection } from '@/runtime/projection';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAutoKeyframeStore } from '@/runtime/stores/useAutoKeyframeStore.js';
import { commitTimelineKeyframe } from '@/runtime/timeline/commitTimelineKeyframe';
import { isAutoLayoutChild } from '@/engine/layout/isAutoLayoutChild';
import { createSessionCommitActions } from '@/runtime/input/sessionCommitRuntimeBridge.js';

let _unsub = null;

function canAuthorAnimationKeyframes() {
    const runtimeState = getRuntimeSnapshot();
    if (runtimeState?.isReplaying) return false;

    const workspaceId = getWorkspaceProjection()?.id ?? 'graphic';
    const policy = resolveWorkspacePolicy(workspaceId);
    if (!policy?.capabilities?.timeline) return false;

    return true;
}

export function registerSessionCommitBridge(dispatch) {
    if (_unsub) return _unsub;

    const handler = (event) => {
        const runtimeState = getRuntimeSnapshot();
        const nodesById = runtimeState?.nodes || {};
        const selectedIds = useRuntimeStore.getState().selection?.ids || [];
        const frameTime = useRuntimeStore.getState().frameTime;
        const autoKeyframeEnabled = useAutoKeyframeStore.getState()?.enabled;

        const actions = createSessionCommitActions({
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

        if (!actions) return;

        if (typeof dispatch === 'function') {
            actions.dispatchEvents.forEach((evt) => dispatch(evt));
        } else {
            console.warn('[sessionCommitBridge] Dispatch not provided; skipping dispatch.');
        }

        if (actions.timelineKeyframes.length) {
            if (typeof dispatch === 'function') {
                actions.timelineKeyframes.forEach((entry) => {
                    commitTimelineKeyframe({
                        dispatcher: { dispatch },
                        nodeId: entry.nodeId,
                        trackId: entry.trackId,
                        time: entry.time,
                        property: entry.property,
                        value: entry.value,
                    });
                });
            } else {
                console.warn(
                    '[sessionCommitBridge] Dispatch not provided; skipping timeline keyframe commit.'
                );
            }
        }

        actions.keyframeIntents.forEach((intent) => {
            canvasBus.emit('intent.animation.keyframe.create', intent);
        });

        actions.editCommitIntents.forEach((intent) => {
            canvasBus.emit('intent.edit.commit', intent);
        });
    };

    _unsub = canvasBus.on('session.commit', handler);
    return _unsub;
}
