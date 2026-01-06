// runtime/bridge/attachSessionCommitBridge.js

import { EventTypes } from '@/core/events/eventTypes';
import { canvasBus } from '@/ui/canvasBus.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch';
import { isAutoLayoutChild } from '@/engine/layout/isAutoLayoutChild';
import { commitTimelineKeyframe } from '@/timeline/commitTimelineKeyframe';

/**
 * Bridges committed input sessions into runtime events.
 * This is the ONLY place where sessions mutate real state.
 */
export function attachSessionCommitBridge() {
    const dispatcher = createEventDispatcher();
    const getState = dispatcher.getState;
    const bus = canvasBus;

    function onCommit(event) {
        const { sessionType, payload } = event;
        if (!payload || payload.type === 'noop') return;

        if (payload.type === 'reorder') {
            dispatcher.dispatch({
                type: EventTypes.NODE_REORDER,
                payload,
            });
            return;
        }

        if (payload.type === 'reparent') {
            dispatcher.dispatch({
                type: EventTypes.NODE_DETACH,
                payload: { ids: payload.nodeIds },
            });

            dispatcher.dispatch({
                type: EventTypes.NODE_ATTACH,
                payload: {
                    parentId: payload.to,
                    childIds: payload.nodeIds,
                    index: payload.index,
                },
            });
            return;
        }

        // 🔐 Timeline-aware commit (LEGAL ID CREATION)
        if (payload.type === 'timeline-keyframe') {
            const { nodeIds, time, trackId, properties } = payload;

            nodeIds.forEach((nodeId) => {
                Object.entries(properties).forEach(([property, value]) => {
                    commitTimelineKeyframe({
                        dispatcher,
                        nodeId,
                        trackId,
                        time,
                        property,
                        value,
                    });
                });
            });
            return;
        }

        // Handle MoveSession commit
        if (sessionType === 'move') {
            const { nodeIds, delta } = payload;
            const state = getState?.();
            const nodes = state?.nodes || {};

            nodeIds.forEach((id) => {
                const node = nodes[id];
                if (!node || isAutoLayoutChild(node, nodes)) return;

                dispatcher.dispatch({
                    type: EventTypes.NODE_MOVE,
                    payload: {
                        id,
                        xDelta: delta.x,
                        yDelta: delta.y,
                    },
                });
            });
        }
    }

    bus.on('session.commit', onCommit);

    return () => {
        bus.off('session.commit', onCommit);
    };
}
