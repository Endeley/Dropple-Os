// runtime/projection/v1/runtimeSnapshot.js

import {
    __getRuntimeStateInternal,
    __getIsReplayingInternal,
} from '../../state/runtimeState.internal.js';
import { selectionProjection } from '@/runtime/selection/selectionProjection.js';

export function getRuntimeSnapshot() {
    const state = __getRuntimeStateInternal();
    if (!state) return null;

    return {
        nodes: state.nodes,
        rootIds: state.rootIds,
        activeStateId: state.activeStateId,
        activeComponentId: state.activeComponentId,
        timeline: state.timeline,
        selection: selectionProjection(state),
        isReplaying: __getIsReplayingInternal(),
    };
}
