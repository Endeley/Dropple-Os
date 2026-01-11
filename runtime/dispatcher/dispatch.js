// runtime/dispatcher/dispatch.js

import { applyEvent } from '../../core/events/applyEvent.js';
import { applyLayoutPass } from '../layout/applyLayoutPass.js';
import { createAnimationController } from '../animation/animationController.js';
import { interpolateNodes } from '../animation/interpolateNodes.js';
import { easeOutCubic } from '../animation/easing.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { syncRuntimeToZustand } from '../bridge/zustandBridge.js';
import { createHistory } from './history.js';
import {
    getRuntimeState,
    resetRuntimeState,
    setRuntimeState,
    ensureDefaultTimeline,
    setRuntimeError,
} from '../state/runtimeState.js';
import { perfStart, perfEnd } from '@/perf/perfTracker.js';
import { applyTimelineGuard } from '../guards/timelineGuard.js';
import { shouldRunLayout } from '../layout/shouldRunLayout.js';
import { EventSequencer } from '../events/EventSequencer.js';
import { createEventId } from '../events/createEventId.js';
import { runTransitionPreview } from '../preview/runTransitionPreview.js';
import { getTransitionForPreview } from '../preview/getTransitionForPreview.js';

/**
 * Canonical event dispatcher.
 *
 * 🔒 ID POLICY (Phase 8.2):
 * - eventId is assigned HERE
 * - one event → one immutable eventId
 */
export function createEventDispatcher({
    maxHistory = 100,
    workspaceId = null,
    branchId = 'main',
} = {}) {
    const history = createHistory(maxHistory);
    const sequencer = new EventSequencer();
    let currentPreviewCancel = null;

    const animationController = createAnimationController({
        duration: 220,
        easing: easeOutCubic,
        onFrame: (fromState, toState, t) => {
            if (!fromState || !toState) return;
            const animatedNodes = interpolateNodes(fromState.nodes || {}, toState.nodes || {}, t);
            useAnimatedRuntimeStore.setState(
                {
                    nodes: animatedNodes,
                    rootIds: toState.rootIds,
                },
                false
            );
        },
    });

    function commit(nextState, { animate = true } = {}) {
        const prev = getRuntimeState();
        setRuntimeState(nextState);
        if (animate) {
            animationController.start(prev, nextState);
        } else {
            animationController.cancel();
        }
        syncRuntimeToZustand(nextState);
        useAnimatedRuntimeStore.setState(
            {
                nodes: nextState?.nodes || {},
                rootIds: nextState?.rootIds || [],
            },
            false
        );
        return nextState;
    }

    function dispatch(rawEvent) {
        perfStart('dispatch');

        try {
            if (currentPreviewCancel) {
                currentPreviewCancel();
                currentPreviewCancel = null;
            }
            // 🔒 Assign eventId exactly once
            const seq = sequencer.next(branchId);
            const eventId = createEventId({ branchId, nextSeq: seq });

            const event = {
                ...rawEvent,
                id: eventId,
            };

            const guarded = applyTimelineGuard(event);
            if (!guarded) {
                return getRuntimeState();
            }

            const prev = getRuntimeState();
            let next = applyEvent(prev, guarded);
            next = ensureDefaultTimeline(next);

            if (next === prev) return next;

            let layoutMs = 0;
            if (shouldRunLayout(guarded)) {
                perfStart('layout');
                next = applyLayoutPass(next);
                layoutMs = perfEnd('layout');
            }

            const transition = getTransitionForPreview({ prev, next });
            if (transition) {
                currentPreviewCancel = runTransitionPreview({
                    fromState: prev,
                    toState: next,
                    transition,
                    onComplete: (finalState) => {
                        history.push(finalState);
                        commit(finalState, { animate: false });
                        setRuntimeError(null);
                        currentPreviewCancel = null;
                    },
                }).cancel;

                return prev;
            }

            history.push(next);
            const committed = commit(next);

            const t = perfEnd('dispatch');
            if (t > 8) {
                console.warn('dispatch slow:', t.toFixed(2), event.type, 'layout:', layoutMs?.toFixed(2));
            }

            setRuntimeError(null);
            return committed;
        } catch (err) {
            console.error('[Dispatcher error]', err, rawEvent);
            setRuntimeError(err);
            return getRuntimeState();
        } finally {
            perfEnd('dispatch');
        }
    }

    function undo() {
        perfStart('undo');
        const next = history.undo();
        const committed = commit(next);
        perfEnd('undo');
        return committed;
    }

    function redo() {
        perfStart('redo');
        const next = history.redo();
        const committed = commit(next);
        perfEnd('redo');
        return committed;
    }

    function reset() {
        history.reset();
        sequencer.reset();
        resetRuntimeState();
        syncRuntimeToZustand({ nodes: {}, rootIds: [] });
    }

    function getState() {
        return getRuntimeState();
    }

    return {
        dispatch,
        undo,
        redo,
        reset,
        getState,
    };
}
