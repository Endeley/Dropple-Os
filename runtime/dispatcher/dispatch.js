import { applyEvent } from '../../core/events/applyEvent.js';

import { createAnimationController } from '../animation/animationController.js';
import { createPlaybackController } from '../animation/playbackController.js';
import { interpolateNodes } from '../animation/interpolateNodes.js';
import { easeOutCubic } from '../animation/easing.js';

import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { syncRuntimeToZustand } from '../projection/zustandBridge.js';
import { createHistory } from './history.js';

import { getRuntimeState as getRuntimeStatePublic } from '../state/runtimeState.js';
import {
    __getRuntimeStateInternal,
    __setRuntimeStateInternal,
    __resetRuntimeStateInternal,
    __ensureDefaultTimelineInternal,
    __setRuntimeErrorInternal,
    __getIsReplayingInternal,
    __setIsReplayingInternal,
} from '../state/runtimeState.internal.js';

import { emitPerfEvent } from '../instrumentation/perfEvents.js';
import { applyTimelineGuard } from '../guards/timelineGuard.js';
import { applyAnimationGuard } from '../guards/animationGuard.js';
import { EventSequencer } from '../events/EventSequencer.js';
import { createEventId } from '../events/createEventId.js';

import { runTransitionPreview } from '../preview/runTransitionPreview.js';
import { getTransitionForPreview } from '../preview/getTransitionForPreview.js';

import { resolveInteraction } from '../interactions/resolveInteraction.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { resolveBehaviorTrigger } from '@/core/behavior/resolveBehaviorTrigger.js';

import { applyLayoutPass } from '../layout/applyLayoutPass.js';
import { observeUXIntent } from './ux/observeUXIntent.js';
import { createUXWarningEmitter } from './ux/emitUXWarning.js';
import { emitUXWarningEvent } from './ux/uxWarningBus.js';
import { createUXAuditLog } from './ux/uxAuditLog.js';
import { requestUXConfirmation } from './ux/uxConfirmBus.js';
import { shouldConfirmUXAction, defaultUXEnforcementTier } from './ux/shouldConfirmUXAction.js';
import { withMutationOrigin } from '@/core/mutationContext.js';
import { getSystemEventHandler } from '@/core/events/systemEventRegistry.js';
import { checkWorkspacePolicy } from '@/core/contracts/capabilityGate.js';
import { INTENT_CAPS } from '@/core/contracts/intentCapabilities.v1.js';
import {
    getActiveWorkspace,
    getWorkspaceState,
    setActiveWorkspace,
    setCanvasSurface,
    setViewport,
} from '../state/workspaceState.js';

// System-level projection events (never domain mutations)
const SYSTEM_EVENTS = new Set([
    EventTypes.WORKSPACE_SET_ACTIVE,
    EventTypes.WORKSPACE_SET_VIEWPORT,
    EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
    EventTypes.SELECTION_SET,
    EventTypes.SHOT_SET_ACTIVE,
    EventTypes.CLOCK_SEEK,
    EventTypes.CLOCK_PLAY,
    EventTypes.CLOCK_PAUSE,
]);

function cloneState(state) {
    if (typeof structuredClone === 'function') {
        return structuredClone(state);
    }
    return JSON.parse(JSON.stringify(state));
}

export function createEventDispatcher({
    maxHistory = 100,
    workspaceId = null,
    branchId = 'main',
    profile = 'design',
    uxEnforcementTier = defaultUXEnforcementTier,
    headless = false,
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
    const isHeadless = Boolean(headless) || typeof window === 'undefined';

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
        dispatchEvent: dispatch,
    });

    function commit(nextState, { animate = true } = {}) {
        const prev = __getRuntimeStateInternal();

        __setRuntimeStateInternal(nextState, 'dispatcher');

        if (!isHeadless && animate && !isReplaying) {
            playbackController.play({
                fromState: prev,
                toState: nextState,
            });
        } else {
            playbackController.cancel();
        }

        syncRuntimeToZustand(nextState);

        // Derived layout ONLY
        if (!__getIsReplayingInternal()) {
            const derived = applyLayoutPass(nextState);
            useAnimatedRuntimeStore.setState(derived, false);
        }

        return nextState;
    }

    function setReplaying(value) {
        return withMutationOrigin('dispatcher', () => {
            isReplaying = Boolean(value);
            __setIsReplayingInternal(isReplaying);
        });
    }

    function hydrateRuntimeState(nextState, { animate = false } = {}) {
        return withMutationOrigin('dispatcher', () => {
            setReplaying(false);
            const ensured = __ensureDefaultTimelineInternal(nextState);
            return commit(ensured, { animate });
        });
    }

    async function dispatch(rawEvent) {
        return withMutationOrigin('dispatcher', async () => {
            if (rawEvent && Object.prototype.hasOwnProperty.call(rawEvent, 'id')) {
                throw new Error(
                    'Illegal event: event IDs may only be assigned by dispatcher'
                );
            }

            const observation = observeUXIntent({
                profile,
                actionType: rawEvent?.type,
            });

            if (process.env.NODE_ENV === 'development') {
                const SYSTEM_EVENT_PREFIXES = ['workspace/', 'viewport/', 'camera/'];
                const isSystemEvent = SYSTEM_EVENT_PREFIXES.some((prefix) =>
                    rawEvent?.type?.startsWith(prefix),
                );

                if (!isSystemEvent) {
                    const workspace = getWorkspaceState();
                    const requiredCaps = INTENT_CAPS[rawEvent?.type];
                    const mutationType = rawEvent?.type;
                    const verdict = checkWorkspacePolicy({
                        workspace,
                        requiredCaps,
                        mutationType,
                    });

                    if (!verdict.ok && verdict.reason !== 'NO_POLICY') {
                        console.warn(
                            '[Skeleton v2] Intent blocked by capability gate',
                            {
                                intent: rawEvent?.type,
                                mode: workspace?.id ?? getActiveWorkspace(),
                                reason: verdict.reason,
                                cap: verdict.cap,
                            },
                        );
                    }
                }
            }

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
                            return __getRuntimeStateInternal();
                        }

                        confirmedActionTypes.add(actionType);
                    }
                }
            }

            emitPerfEvent({ type: 'start', label: 'dispatch' });
            let didExecute = false;

            try {
                if (currentPreviewCancel) {
                    currentPreviewCancel();
                    currentPreviewCancel = null;
                }

                const seq = sequencer.next(branchId);
                const eventId = createEventId({ branchId, nextSeq: seq });
                const event = { ...rawEvent, id: eventId };

                if (event.type === EventTypes.BEHAVIOR_TRIGGER_FIRE) {
                    const runtimeState = __getRuntimeStateInternal();
                    const workspace = getWorkspaceState();
                    const workspaceId = workspace?.id ?? getActiveWorkspace();
                    const policy = workspace;
                    const allowed = policy?.enabledTriggerTypes;

                    if (allowed && !allowed.has(event.payload?.triggerType)) {
                        return runtimeState;
                    }

                    const resolved = resolveBehaviorTrigger({
                        entityId: event.payload?.entityId,
                        triggerType: event.payload?.triggerType,
                        world: runtimeState,
                    });

                    if (!resolved) return runtimeState;

                    return await dispatch(resolved);
                }

                const workspace = getWorkspaceState();
                const workspaceId = workspace?.id ?? getActiveWorkspace();
                const policy = workspace;
                const requiredCaps = INTENT_CAPS[event.type] ?? [];
                const mutationType =
                    event.type === EventTypes.SELECTION_SET ||
                    event.type === EventTypes.WORKSPACE_SET_ACTIVE ||
                    event.type === EventTypes.WORKSPACE_SET_VIEWPORT ||
                    event.type === EventTypes.WORKSPACE_SET_CANVAS_SURFACE
                        ? 'select'
                        : event.type.startsWith('EXPORT')
                        ? 'export'
                        : event.type.includes('KEYFRAME') || event.type.includes('TIMELINE')
                        ? 'timelineEdit'
                        : event.type.includes('CREATE')
                        ? 'create'
                        : event.type.includes('DELETE')
                        ? 'delete'
                        : 'mutate';

                if (!SYSTEM_EVENTS.has(event.type)) {
                    console.log('DEBUG WORKSPACE', {
                        workspaceId,
                        requiredCaps,
                        policyCaps: policy?.policy?.capabilities,
                        mutation: policy?.policy?.mutation,
                    });
                    const verdict = checkWorkspacePolicy({
                        workspace,
                        requiredCaps,
                        mutationType,
                    });

                    if (!verdict.ok) {
                        return __getRuntimeStateInternal();
                    }
                }

                if (SYSTEM_EVENTS.has(event.type)) {
                    const handler = getSystemEventHandler(event.type);
                    if (handler) {
                        handler(event);
                        return __getRuntimeStateInternal();
                    }
                }

                if (event?.type === EventTypes.WORKSPACE_SET_ACTIVE) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[WORKSPACE_SET_ACTIVE]', {
                            id: event?.payload?.id,
                            workspaceDef: event?.payload?.workspaceDef?.id,
                        });
                    }
                    setActiveWorkspace(event?.payload?.id, event?.payload?.workspaceDef ?? null);
                    return __getRuntimeStateInternal();
                }

                if (event?.type === EventTypes.WORKSPACE_SET_VIEWPORT) {
                    setViewport(event?.payload?.viewport);
                    return __getRuntimeStateInternal();
                }

                if (event?.type === EventTypes.WORKSPACE_SET_CANVAS_SURFACE) {
                    setCanvasSurface(event?.payload?.surface);
                    return __getRuntimeStateInternal();
                }

                if (event?.type === EventTypes.SHOT_SET_ACTIVE) {
                    const shotId = event?.payload?.shotId ?? null;
                    const current = __getRuntimeStateInternal();
                    const runtimeScene = current?.scene ?? null;
                    if (!runtimeScene || !shotId) {
                        if (process.env.NODE_ENV === 'development') {
                            console.warn('[SHOT_SET_ACTIVE] Invalid payload or missing scene', {
                                shotId,
                                hasScene: Boolean(runtimeScene),
                            });
                        }
                        return current;
                    }

                    const sceneGraph = current?.sceneGraph;
                    if (sceneGraph?.scenes?.length) {
                        const activeSceneId = runtimeScene.activeSceneId;
                        const activeScene = sceneGraph.scenes.find((scene) => scene.id === activeSceneId);
                        const hasShot = activeScene?.shots?.some((shot) => shot.id === shotId);
                        if (!hasShot) {
                            if (process.env.NODE_ENV === 'development') {
                                console.warn('[SHOT_SET_ACTIVE] Shot not found in active scene', {
                                    shotId,
                                    activeSceneId,
                                });
                            }
                            return current;
                        }
                    }

                    const nextState = {
                        ...current,
                        scene: {
                            ...runtimeScene,
                            activeShotId: shotId,
                        },
                    };
                    __setRuntimeStateInternal(nextState, 'dispatcher');
                    syncRuntimeToZustand(nextState);
                    return __getRuntimeStateInternal();
                }

                const guarded = applyTimelineGuard(event);
                if (!guarded) return __getRuntimeStateInternal();

                const animationGuarded = applyAnimationGuard(guarded);
                if (!animationGuarded) return __getRuntimeStateInternal();

                // Interaction execution
                if (rawEvent.type === 'interaction/execute') {
                    const runtimeState = __getRuntimeStateInternal();
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

                const prev = __getRuntimeStateInternal();
                didExecute = true;
                let next = applyEvent(prev, animationGuarded);
                if (rawEvent?.type === EventTypes.NODE_CREATE) {
                    console.log('[dispatcher] post-reduction NODE_CREATE nextState.nodes:', next?.nodes);
                }
                next = __ensureDefaultTimelineInternal(next);

                if (next === prev) return next;

                // 🔒 Transition preview is FORBIDDEN during replay
                const canPreview = !isReplaying && !isHeadless;
                const transition = canPreview && getTransitionForPreview({ prev, next });

                if (transition) {
                    const preview = runTransitionPreview({
                        fromState: prev,
                        toState: next,
                        transition,
                        onComplete: (finalState) => {
                            withMutationOrigin('dispatcher', () => {
                                history.push(cloneState(finalState));
                                commit(finalState, { animate: false });
                                __setRuntimeErrorInternal(null);
                                currentPreviewCancel = null;
                            });
                        },
                    });

                    currentPreviewCancel = preview.cancel;
                    return prev;
                }

                const committed = commit(next);
                history.push(cloneState(__getRuntimeStateInternal()));
                return committed;
            } catch (err) {
                console.error('[Dispatcher error]', err, rawEvent);
                __setRuntimeErrorInternal(err);
                return __getRuntimeStateInternal();
            } finally {
                emitPerfEvent({ type: 'end', label: 'dispatch' });
                if (didExecute) {
                    emitUXWarning(observation);
                }
            }
        });
    }

    function undo() {
        return withMutationOrigin('dispatcher', () => {
            setReplaying(true);
            if (currentPreviewCancel) currentPreviewCancel();
            playbackController.cancel();
            const result = commit(history.undo(), { animate: false });
            setReplaying(false);
            return result;
        });
    }

    function redo() {
        return withMutationOrigin('dispatcher', () => {
            setReplaying(true);
            if (currentPreviewCancel) currentPreviewCancel();
            playbackController.cancel();
            const result = commit(history.redo(), { animate: false });
            setReplaying(false);
            return result;
        });
    }

    function reset() {
        return withMutationOrigin('dispatcher', () => {
            setReplaying(false);
            playbackController.cancel();
            history.reset();
            sequencer.reset();
            __resetRuntimeStateInternal();
            useAnimatedRuntimeStore.setState({ nodes: {}, rootIds: [] }, false);
        });
    }

    return {
        dispatch,
        undo,
        redo,
        reset,
        setReplaying,
        hydrateRuntimeState,
        getUXAuditLog: uxAuditLog.snapshot,
        getState: getRuntimeStatePublic,
    };
}
