// runtime/dispatcher/dispatch.js

import { applyEvent } from '../../core/events/applyEvent.js';
import { applyLayoutPass } from '../layout/applyLayoutPass.js';

import { createAnimationController } from '../animation/animationController.js';
import { createPlaybackController } from '../animation/playbackController.js';

import { interpolateNodes } from '../animation/interpolateNodes.js';
import { easeOutCubic } from '../animation/easing.js';

import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { syncRuntimeToZustand } from '../bridge/zustandBridge.js';
import { createHistory } from './history.js';

import { getRuntimeState, resetRuntimeState, setRuntimeState, ensureDefaultTimeline, setRuntimeError } from '../state/runtimeState.js';

import { perfStart, perfEnd } from '@/perf/perfTracker.js';
import { applyTimelineGuard } from '../guards/timelineGuard.js';
import { applyAnimationGuard } from '../guards/animationGuard.js';
import { shouldRunLayout } from '../layout/shouldRunLayout.js';
import { EventSequencer } from '../events/EventSequencer.js';
import { createEventId } from '../events/createEventId.js';

import { runTransitionPreview } from '../preview/runTransitionPreview.js';
import { getTransitionForPreview } from '../preview/getTransitionForPreview.js';

import { resolveInteraction } from '../interactions/resolveInteraction.js';
import { EventTypes } from '@/core/events/eventTypes.js';

export function createEventDispatcher({ maxHistory = 100, workspaceId = null, branchId = 'main' } = {}) {
    const history = createHistory(maxHistory);
    const sequencer = new EventSequencer();

    let currentPreviewCancel = null;

    // ─────────────────────────────────────────────
    // Animation infrastructure (execution only)
    // ─────────────────────────────────────────────
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

    // ✅ NEW: playback orchestrator
    const playbackController = createPlaybackController({
        animationController,
    });

    function commit(nextState, { animate = true } = {}) {
        const prev = getRuntimeState();
        setRuntimeState(nextState);

        if (animate) {
            playbackController.play({
                fromState: prev,
                toState: nextState,
            });
        } else {
            playbackController.cancel();
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

            const seq = sequencer.next(branchId);
            const eventId = createEventId({ branchId, nextSeq: seq });

            const event = { ...rawEvent, id: eventId };

            const guarded = applyTimelineGuard(event);
            if (!guarded) return getRuntimeState();

            const animationGuarded = applyAnimationGuard(guarded);
            if (!animationGuarded) return getRuntimeState();

            // Phase 3 — Interaction execution
            if (rawEvent.type === 'interaction/execute') {
                const runtimeState = getRuntimeState();
                const { trigger, sourceId } = rawEvent.payload || {};

                const interaction = resolveInteraction({
                    trigger,
                    sourceId,
                    runtimeState,
                });

                if (!interaction) return runtimeState;

                if (interaction.action === 'set_state') {
                    return dispatch({
                        type: EventTypes.STATE_SET,
                        payload: { stateId: interaction.targetStateId },
                    });
                }

                if (interaction.action === 'set_component_active') {
                    return dispatch({
                        type: EventTypes.COMPONENT_SET_ACTIVE,
                        payload: { componentId: interaction.targetComponentId },
                    });
                }

                return runtimeState;
            }

            const prev = getRuntimeState();
            let next = applyEvent(prev, animationGuarded);
            next = ensureDefaultTimeline(next);

            if (next === prev) return next;

            if (shouldRunLayout(guarded)) {
                next = applyLayoutPass(next);
            }

            // Phase 2 — Transition preview (illusion)
            const transition = getTransitionForPreview({ prev, next });
            if (transition) {
                const preview = runTransitionPreview({
                    fromState: prev,
                    toState: next,
                    transition,
                    onComplete: (finalState) => {
                        // ✅ Truth commit happens ONLY after preview completes
                        history.push(finalState);
                        commit(finalState, { animate: false });
                        setRuntimeError(null);
                        currentPreviewCancel = null;
                    },
                });

                currentPreviewCancel = preview.cancel;

                // ✅ Preview is an illusion: runtime truth stays at prev until completion
                return prev;
            }

            history.push(next);
            return commit(next);
        } catch (err) {
            console.error('[Dispatcher error]', err, rawEvent);
            setRuntimeError(err);
            return getRuntimeState();
        } finally {
            perfEnd('dispatch');
        }
    }

    function undo() {
        if (currentPreviewCancel) {
            currentPreviewCancel();
            currentPreviewCancel = null;
        }
        playbackController.cancel();
        return commit(history.undo(), { animate: false });
    }

    function redo() {
        if (currentPreviewCancel) {
            currentPreviewCancel();
            currentPreviewCancel = null;
        }
        playbackController.cancel();
        return commit(history.redo(), { animate: false });
    }

    function reset() {
        playbackController.cancel();
        history.reset();
        sequencer.reset();
        resetRuntimeState();
        syncRuntimeToZustand({ nodes: {}, rootIds: [] });
    }

    return {
        dispatch,
        undo,
        redo,
        reset,
        getState: getRuntimeState,
    };
}
