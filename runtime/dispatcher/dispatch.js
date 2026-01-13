// runtime/dispatcher/dispatch.js

import { applyEvent } from '../../core/events/applyEvent.js';
import { applyLayoutPass } from '../layout/applyLayoutPass.js';
import { createAnimationController } from '../animation/animationController.js';
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

/**
 * Canonical event dispatcher.
 *
 * 🔒 Invariants:
 * - Single mutation gate
 * - Preview is illusion only
 * - Reducers are pure
 * - History records truth only
 */
export function createEventDispatcher({ maxHistory = 100, workspaceId = null, branchId = 'main' } = {}) {
    const history = createHistory(maxHistory);
    const sequencer = new EventSequencer();

    // Active preview cancellation handle (illusion only)
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

        // Animated store mirrors truth after commit
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
            // Cancel any active preview before new mutation
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
            const animationGuarded = applyAnimationGuard(guarded);
            if (!animationGuarded) {
                return getRuntimeState();
            }

            // ─────────────────────────────────────────────
            // Phase 3 — Interaction execution (control event)
            // ─────────────────────────────────────────────
            if (rawEvent.type === 'interaction/execute') {
                const runtimeState = getRuntimeState();
                const { trigger, sourceId } = rawEvent.payload || {};

                const interaction = resolveInteraction({
                    trigger,
                    sourceId,
                    runtimeState,
                });

                if (!interaction) {
                    return runtimeState;
                }

                if (interaction.action === 'set_state' && interaction.targetStateId) {
                    return dispatch({
                        type: EventTypes.STATE_SET,
                        payload: { stateId: interaction.targetStateId },
                    });
                }

                if (interaction.action === 'set_component_active' && interaction.targetComponentId) {
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

            let layoutMs = 0;
            if (shouldRunLayout(guarded)) {
                perfStart('layout');
                next = applyLayoutPass(next);
                layoutMs = perfEnd('layout');
            }

            // ─────────────────────────────────────────────
            // Phase 2 — Transition preview (illusion only)
            // ─────────────────────────────────────────────
            const transition = getTransitionForPreview({ prev, next });
            if (transition) {
                const preview = runTransitionPreview({
                    fromState: prev,
                    toState: next,
                    transition,
                    onComplete: () => {
                        currentPreviewCancel = null;
                    },
                });

                currentPreviewCancel = preview.cancel;

                // Commit truth immediately (preview does NOT commit)
                history.push(next);
                const committed = commit(next, { animate: false });
                setRuntimeError(null);
                return committed;
            }

            // ─────────────────────────────────────────────
            // Normal commit path
            // ─────────────────────────────────────────────
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
        if (currentPreviewCancel) {
            currentPreviewCancel();
            currentPreviewCancel = null;
        }
        const next = history.undo();
        const committed = commit(next);
        perfEnd('undo');
        return committed;
    }

    function redo() {
        perfStart('redo');
        if (currentPreviewCancel) {
            currentPreviewCancel();
            currentPreviewCancel = null;
        }
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
