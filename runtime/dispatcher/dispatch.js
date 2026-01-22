import { applyEvent } from '../../core/events/applyEvent.js';

import { createAnimationController } from '../animation/animationController.js';
import { createPlaybackController } from '../animation/playbackController.js';
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
    getIsReplaying,
} from '../state/runtimeState.js';

import { perfStart, perfEnd } from '@/perf/perfTracker.js';
import { applyTimelineGuard } from '../guards/timelineGuard.js';
import { applyAnimationGuard } from '../guards/animationGuard.js';
import { EventSequencer } from '../events/EventSequencer.js';
import { createEventId } from '../events/createEventId.js';

import { runTransitionPreview } from '../preview/runTransitionPreview.js';
import { getTransitionForPreview } from '../preview/getTransitionForPreview.js';

import { resolveInteraction } from '../interactions/resolveInteraction.js';
import { EventTypes } from '@/core/events/eventTypes.js';

import { applyLayoutPass } from '../layout/applyLayoutPass.js';
import { observeUXIntent } from './ux/observeUXIntent.js';
import { createUXWarningEmitter } from './ux/emitUXWarning.js';
import { emitUXWarningEvent } from './ux/uxWarningBus.js';
import { createUXAuditLog } from './ux/uxAuditLog.js';
import { requestUXConfirmation } from './ux/uxConfirmBus.js';
import { shouldConfirmUXAction, defaultUXEnforcementTier } from './ux/shouldConfirmUXAction.js';

export function createEventDispatcher({
    maxHistory = 100,
    workspaceId = null,
    branchId = 'main',
    profile = 'design',
    uxEnforcementTier = defaultUXEnforcementTier,
} = {}) {
    const history = createHistory(maxHistory);
    const sequencer = new EventSequencer();
    const uxAuditLog = createUXAuditLog();
    const emitUXWarning = createUXWarningEmitter({
        onEvent: emitUXWarningEvent,
        onAudit: (entry) => uxAuditLog.append(entry),
    });
    const confirmedActionTypes = new Set();
    let pendingConfirmation = null;

    let currentPreviewCancel = null;
    let isReplaying = false; // 🔒 REPLAY GUARD FLAG

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
                false,
            );
        },
    });

    const playbackController = createPlaybackController({
        animationController,
    });

    function commit(nextState, { animate = true } = {}) {
        const prev = getRuntimeState();

        setRuntimeState(nextState);

        if (animate && !isReplaying) {
            playbackController.play({
                fromState: prev,
                toState: nextState,
            });
        } else {
            playbackController.cancel();
        }

        syncRuntimeToZustand(nextState);

        // Derived layout ONLY
        if (!getIsReplaying()) {
            const derived = applyLayoutPass(nextState);
            useAnimatedRuntimeStore.setState(derived, false);
        }

        return nextState;
    }

    async function dispatch(rawEvent) {
        if (rawEvent && Object.prototype.hasOwnProperty.call(rawEvent, 'id')) {
            throw new Error(
                'Illegal event: event IDs may only be assigned by dispatcher'
            );
        }

        const observation = observeUXIntent({
            profile,
            actionType: rawEvent?.type,
        });

        if (
            shouldConfirmUXAction({
                profile,
                intent: observation.intent,
                uxEnforcementTier,
            })
        ) {
            const actionType = observation.actionType;

            if (actionType && !confirmedActionTypes.has(actionType)) {
                if (pendingConfirmation) {
                    await pendingConfirmation;
                }

                if (!confirmedActionTypes.has(actionType)) {
                    const confirmationPromise = requestUXConfirmation({ actionType });
                    pendingConfirmation = confirmationPromise;
                    const confirmed = await confirmationPromise;
                    pendingConfirmation = null;

                    if (!confirmed) {
                        return getRuntimeState();
                    }

                    confirmedActionTypes.add(actionType);
                }
            }
        }

        perfStart('dispatch');
        let didExecute = false;

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

            // Interaction execution
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
                    return await dispatch({
                        type: EventTypes.STATE_SET,
                        payload: { stateId: interaction.targetStateId },
                    });
                }

                if (interaction.action === 'set_component_active') {
                    return await dispatch({
                        type: EventTypes.COMPONENT_SET_ACTIVE,
                        payload: { componentId: interaction.targetComponentId },
                    });
                }

                return runtimeState;
            }

            const prev = getRuntimeState();
            didExecute = true;
            let next = applyEvent(prev, animationGuarded);
            next = ensureDefaultTimeline(next);

            if (next === prev) return next;

            // 🔒 Transition preview is FORBIDDEN during replay
            const canPreview = !isReplaying;
            const transition = canPreview && getTransitionForPreview({ prev, next });

            if (transition) {
                const preview = runTransitionPreview({
                    fromState: prev,
                    toState: next,
                    transition,
                    onComplete: (finalState) => {
                        history.push(finalState);
                        commit(finalState, { animate: false });
                        setRuntimeError(null);
                        currentPreviewCancel = null;
                    },
                });

                currentPreviewCancel = preview.cancel;
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
            if (didExecute) {
                emitUXWarning(observation);
            }
        }
    }

    function undo() {
        isReplaying = true;
        if (currentPreviewCancel) currentPreviewCancel();
        playbackController.cancel();
        const result = commit(history.undo(), { animate: false });
        isReplaying = false;
        return result;
    }

    function redo() {
        isReplaying = true;
        if (currentPreviewCancel) currentPreviewCancel();
        playbackController.cancel();
        const result = commit(history.redo(), { animate: false });
        isReplaying = false;
        return result;
    }

    function reset() {
        isReplaying = false;
        playbackController.cancel();
        history.reset();
        sequencer.reset();
        resetRuntimeState();
        useAnimatedRuntimeStore.setState({ nodes: {}, rootIds: [] }, false);
    }

    return {
        dispatch,
        undo,
        redo,
        reset,
        getUXAuditLog: uxAuditLog.snapshot,
        getState: getRuntimeState,
    };
}
