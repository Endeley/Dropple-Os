import { applyEvent } from '../../core/events/applyEvent.js';
import { getRootIds, getSceneGraph, getNodes } from '@/runtime/document/documentAdapter.js';
import { alignNodes } from '@/engine/alignment/alignNodes.js';
import { distributeNodes } from '@/engine/alignment/distributeNodes.js';
import { convertLayout } from '@/engine/layout/convertLayout.js';

import { createAnimationController } from '../animation/animationController.js';
import { createPlaybackController } from '../animation/playbackController.js';
import { interpolateNodes } from '../animation/interpolateNodes.js';
import { easeOutCubic } from '../animation/easing.js';

import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { useRuntimeStore } from '../stores/useRuntimeStore.js';
import { syncRuntimeToZustand } from '../projection/zustandBridge.js';
import { createHistory } from './history.js';

import { getRuntimeState as getRuntimeStatePublic } from '../state/runtimeState.js';
import {
    __getRuntimeStateInternal,
    __setRuntimeStateInternal,
    __resetRuntimeStateInternal,
    __ensureDefaultTimelineInternal,
    __ensureDefaultWorkspaceInternal,
    initialRuntimeState,
    __setRuntimeErrorInternal,
    __getIsReplayingInternal,
    __setIsReplayingInternal,
} from '../state/runtimeState.internal.js';

import { emitPerfEvent } from '../instrumentation/perfEvents.js';
import { applyTimelineGuard } from '../guards/timelineGuard.js';
import { applyAnimationGuard } from '../guards/animationGuard.js';
import { applyStructureGuard } from '../guards/structureGuard.js';
import { EventSequencer } from '../events/EventSequencer.js';
import { createEventId } from '../events/createEventId.js';

import { runTransitionPreview } from '../preview/runTransitionPreview.js';
import { getTransitionForPreview } from '../preview/getTransitionForPreview.js';

import { resolveInteraction } from '../interactions/resolveInteraction.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { resolveBehaviorTrigger } from '@/core/behavior/resolveBehaviorTrigger.js';

import { applyLayoutPass } from '../layout/applyLayoutPass.js';
import { shouldRunLayout } from '../layout/shouldRunLayout.js';
import { evaluateSceneIncremental } from '@/runtime/evaluation/index.js';
import { evaluateComponents } from '@/runtime/components/index.js';
import { evaluateData } from '@/runtime/data/index.js';
import { evaluateAppRuntime } from '@/runtime/appRuntime/index.js';
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
    applyWorkspaceActivation,
    applyViewportUpdate,
    applyCanvasSurfaceUpdate,
} from '../state/workspaceRuntime.js';
import {
    initialToolRuntimeState,
    registerToolSource,
    setRuntimeActiveTool,
    unregisterToolSource,
} from '@/runtime/tools/toolRuntime.js';
import {
    endDrag,
    initialDragState,
    startDrag,
    updateDrag,
} from '@/runtime/interaction/dragRuntime.js';
import { isShotTransitionValidationError } from '@/core/project/normalizeShotTransitionOut.js';

function clearAnimatedPreview() {
    useAnimatedRuntimeStore.setState(
        {
            previewNodes: {},
            cameraTransform: null,
        },
        false,
    );
}

// System-level projection events (never domain mutations)
const SYSTEM_EVENTS = new Set([
    EventTypes.WORKSPACE_SET_ACTIVE,
    EventTypes.WORKSPACE_SET_VIEWPORT,
    EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
    EventTypes.TOOLS_REGISTER,
    EventTypes.TOOLS_UNREGISTER,
    EventTypes.TOOL_SET_ACTIVE,
    EventTypes.DRAG_START,
    EventTypes.DRAG_UPDATE,
    EventTypes.DRAG_END,
    EventTypes.SELECTION_SET,
    EventTypes.SELECTION_CLEAR,
    EventTypes.SELECTION_TOGGLE,
    EventTypes.SELECTION_ADD,
    EventTypes.SELECTION_REMOVE,
    EventTypes.CLIPBOARD_SET,
    EventTypes.CLIPBOARD_CLEAR,
    EventTypes.SHOT_SET_ACTIVE,
    EventTypes.AI_REQUEST_ENQUEUE,
    EventTypes.AI_REQUEST_COMPLETE,
    EventTypes.AI_REQUEST_FAIL,
    EventTypes.CLOCK_SEEK,
    EventTypes.CLOCK_PLAY,
    EventTypes.CLOCK_PAUSE,
]);

function isCollaborationRuntimeEvent(eventType) {
    return typeof eventType === 'string' && eventType.startsWith('collaboration/');
}

function cloneState(state) {
    if (typeof structuredClone === 'function') {
        return structuredClone(state);
    }
    return JSON.parse(JSON.stringify(state));
}

function getWorkspaceFromRuntime() {
    const state = __getRuntimeStateInternal();
    return state?.workspace ?? null;
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

            const animatedNodes = interpolateNodes(getNodes(fromState), getNodes(toState), t);

            useAnimatedRuntimeStore.setState(
                {
                    previewNodes: animatedNodes,
                },
                false,
            );
        },
    });

    const playbackController = createPlaybackController({
        animationController,
        dispatchEvent: dispatch,
    });

    function commit(nextState, { animate = true, event = null } = {}) {
        const prev = __getRuntimeStateInternal();
        const ensured = __ensureDefaultWorkspaceInternal(
            __ensureDefaultTimelineInternal(nextState)
        );
        const layoutApplied = __getIsReplayingInternal() || !shouldRunLayout({
            event,
            runtimeState: ensured,
        })
            ? {
                  nextState: ensured,
                  derived: {
                      nodes: getNodes(ensured),
                      rootIds: getRootIds(ensured),
                  },
              }
            : applyLayoutPass(ensured);
        const committedState = layoutApplied?.nextState ?? ensured;

        __setRuntimeStateInternal(committedState, 'dispatcher');

        if (!isHeadless && animate && !isReplaying) {
            playbackController.play({
                fromState: prev,
                toState: committedState,
            });
        } else {
            playbackController.cancel();
        }

        syncRuntimeToZustand(committedState, {
            uxAudit: uxAuditLog.snapshot(),
        });
        clearAnimatedPreview();

        return committedState;
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
                    const workspace = getWorkspaceFromRuntime();
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
                                mode: workspace?.id ?? 'graphic',
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
                    const workspace = getWorkspaceFromRuntime();
                    const workspaceId = workspace?.id ?? 'graphic';
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

                const workspace = getWorkspaceFromRuntime();
                const workspaceId = workspace?.id ?? 'graphic';
                const policy = workspace;
                const requiredCaps = INTENT_CAPS[event.type] ?? [];
                const collaborationRuntimeEvent = isCollaborationRuntimeEvent(event.type);
                const mutationType =
                    event.type === EventTypes.SELECTION_SET ||
                    event.type === EventTypes.SELECTION_CLEAR ||
                    event.type === EventTypes.SELECTION_TOGGLE ||
                    event.type === EventTypes.SELECTION_ADD ||
                    event.type === EventTypes.SELECTION_REMOVE ||
                    event.type === EventTypes.CLIPBOARD_SET ||
                    event.type === EventTypes.CLIPBOARD_CLEAR ||
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

                if (!SYSTEM_EVENTS.has(event.type) && !collaborationRuntimeEvent) {
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
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextWorkspace = applyWorkspaceActivation(
                        current.workspace,
                        event?.payload?.workspaceDef ?? null
                    );
                    const workspaceTools =
                        event?.payload?.workspaceDef?.tools ??
                        event?.payload?.workspaceDef?.ui?.tools ??
                        [];
                    const nextState = {
                        ...current,
                        workspace: nextWorkspace,
                        tools: registerToolSource(
                            current.tools ?? initialToolRuntimeState,
                            {
                                source: 'workspace',
                                tools: workspaceTools,
                            },
                        ),
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.WORKSPACE_SET_VIEWPORT) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextWorkspace = applyViewportUpdate(
                        current.workspace,
                        event?.payload?.viewport
                    );
                    const nextState = {
                        ...current,
                        workspace: nextWorkspace,
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.WORKSPACE_SET_CANVAS_SURFACE) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextWorkspace = applyCanvasSurfaceUpdate(
                        current.workspace,
                        event?.payload?.surface
                    );
                    const nextState = {
                        ...current,
                        workspace: nextWorkspace,
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.TOOLS_REGISTER) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        tools: registerToolSource(
                            current.tools ?? initialToolRuntimeState,
                            event?.payload,
                        ),
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.TOOLS_UNREGISTER) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        tools: unregisterToolSource(
                            current.tools ?? initialToolRuntimeState,
                            event?.payload,
                        ),
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.TOOL_SET_ACTIVE) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        tools: setRuntimeActiveTool(
                            current.tools ?? initialToolRuntimeState,
                            event?.payload,
                        ),
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.DRAG_START) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        interaction: {
                            ...(current.interaction ?? {}),
                            drag: startDrag(
                                current.interaction?.drag ?? initialDragState,
                                event?.payload,
                            ),
                        },
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.DRAG_UPDATE) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        interaction: {
                            ...(current.interaction ?? {}),
                            drag: updateDrag(
                                current.interaction?.drag ?? initialDragState,
                                {
                                    pointer: event?.payload?.pointer,
                                    guides: event?.payload?.guides ?? null,
                                },
                            ),
                        },
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.DRAG_END) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        interaction: {
                            ...(current.interaction ?? {}),
                            drag: endDrag(current.interaction?.drag ?? initialDragState),
                        },
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.CLIPBOARD_SET) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        clipboard: {
                            nodes: structuredClone(event?.payload?.clipboard?.nodes ?? []),
                            rootIds: [...(event?.payload?.clipboard?.rootIds ?? [])],
                        },
                    };
                    return commit(nextState, { animate: false, event });
                }

                if (event?.type === EventTypes.CLIPBOARD_CLEAR) {
                    const current = __getRuntimeStateInternal() ?? initialRuntimeState;
                    const nextState = {
                        ...current,
                        clipboard: {
                            nodes: [],
                            rootIds: [],
                        },
                    };
                    return commit(nextState, { animate: false, event });
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

                    const sceneGraph = getSceneGraph(current);
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
                    syncRuntimeToZustand(nextState, {
                        uxAudit: uxAuditLog.snapshot(),
                    });
                    return __getRuntimeStateInternal();
                }

                const guarded = applyTimelineGuard(event);
                if (!guarded) return __getRuntimeStateInternal();

                const animationGuarded = applyAnimationGuard(guarded);
                if (!animationGuarded) return __getRuntimeStateInternal();

                const structureGuarded = applyStructureGuard(animationGuarded);
                if (!structureGuarded) return __getRuntimeStateInternal();

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

                if (rawEvent.type === EventTypes.ALIGN_NODES) {
                    const runtimeState = __getRuntimeStateInternal();
                    const nodeIds = Array.isArray(rawEvent.payload?.nodeIds)
                        ? rawEvent.payload.nodeIds
                        : [];
                    if (nodeIds.length < 2) return runtimeState;

                    const nodesById = getNodes(runtimeState);
                    const nodes = nodeIds
                        .map((id) => nodesById[id])
                        .filter(Boolean);

                    const updates = alignNodes(nodes, rawEvent.payload?.alignment);
                    if (!updates.length) return runtimeState;

                    return await dispatch({
                        type: 'node.layout.bulk',
                        payload: { updates },
                    });
                }

                if (rawEvent.type === EventTypes.DISTRIBUTE_NODES) {
                    const runtimeState = __getRuntimeStateInternal();
                    const nodeIds = Array.isArray(rawEvent.payload?.nodeIds)
                        ? rawEvent.payload.nodeIds
                        : [];
                    if (nodeIds.length < 3) return runtimeState;

                    const nodesById = getNodes(runtimeState);
                    const nodes = nodeIds
                        .map((id) => nodesById[id])
                        .filter(Boolean);

                    const updates = distributeNodes(nodes, rawEvent.payload?.axis);
                    if (!updates.length) return runtimeState;

                    return await dispatch({
                        type: 'node.layout.bulk',
                        payload: { updates },
                    });
                }

                if (rawEvent.type === EventTypes.LAYOUT_CONVERT) {
                    const runtimeState = __getRuntimeStateInternal();
                    const payload = rawEvent.payload || {};
                    const containerId = payload.containerId;
                    const nodesById = getNodes(runtimeState);
                    if (!containerId || nodesById[containerId]) return runtimeState;

                    const plan = convertLayout({
                        layout: payload.layout,
                        nodeIds: payload.nodeIds,
                        nodesById,
                        containerId,
                        options: {
                            ...(payload.options || {}),
                            columns: payload.columns,
                            rows: payload.rows,
                        },
                    });

                    if (!plan) return runtimeState;

                    await dispatch({
                        type: EventTypes.NODE_CREATE,
                        payload: { node: plan.container },
                    });

                    if (plan.parentId) {
                        const parent = nodesById[plan.parentId];
                        const childSet = new Set(plan.childIds || []);
                        let index = undefined;
                        if (parent && Array.isArray(parent.children)) {
                            const indices = parent.children
                                .map((id, i) => (childSet.has(id) ? i : -1))
                                .filter((i) => i >= 0);
                            if (indices.length) {
                                index = Math.min(...indices);
                            }
                        }

                        await dispatch({
                            type: EventTypes.NODE_ATTACH,
                            payload: {
                                parentId: plan.parentId,
                                childId: plan.container.id,
                                index,
                            },
                        });
                    }

                    await dispatch({
                        type: EventTypes.NODE_ATTACH,
                        payload: {
                            parentId: plan.container.id,
                            childIds: plan.childIds,
                        },
                    });

                    return __getRuntimeStateInternal();
                }

                const prev = __getRuntimeStateInternal();
                didExecute = true;
                let next = applyEvent(prev, structureGuarded);
                next = evaluateData(next?.document, next);
                next = evaluateComponents(next?.document, next);
                next = evaluateAppRuntime(next?.document, next);
                evaluateSceneIncremental({
                    event: structureGuarded,
                    document: next?.document,
                    runtime: next,
                });
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

                const committed = commit(next, { event });
                if (!SYSTEM_EVENTS.has(event.type) && !collaborationRuntimeEvent) {
                    history.push(cloneState(__getRuntimeStateInternal()));
                    const store = useRuntimeStore.getState();
                    useRuntimeStore.setState({
                        events: [...store.events, event],
                        cursorIndex: store.events.length,
                    });
                }
                return committed;
            } catch (err) {
                if (isShotTransitionValidationError(err)) {
                    __setRuntimeErrorInternal(err);
                    return __getRuntimeStateInternal();
                }
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
            useRuntimeStore.setState({ events: [], cursorIndex: -1 });
            clearAnimatedPreview();
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
