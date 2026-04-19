import { handleCapabilityIntent } from '@/runtime/capabilities/toolRegistrationRuntime.js';

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
import { applyWorkspaceActivation, applyViewportUpdate, applyCanvasSurfaceUpdate } from '../state/workspaceRuntime.js';
import { initialToolRuntimeState, registerToolSource, setRuntimeActiveTool, unregisterToolSource } from '@/runtime/tools/toolRuntime.js';
import { endDrag, initialDragState, startDrag, updateDrag } from '@/runtime/interaction/dragRuntime.js';
import { isShotTransitionValidationError } from '@/core/project/normalizeShotTransitionOut.js';

// --- unchanged helpers omitted for brevity (your original file content stays exactly the same above dispatch) ---

const NON_PERSISTED_EVENTS = new Set([
    EventTypes.WORKSPACE_SET_ACTIVE,
    EventTypes.WORKSPACE_SET_VIEWPORT,
    EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
    EventTypes.TOOLS_REGISTER,
    EventTypes.TOOLS_UNREGISTER,
    EventTypes.TOOL_SET_ACTIVE,
    EventTypes.SELECTION_SET,
    EventTypes.SELECTION_CLEAR,
    EventTypes.SELECTION_TOGGLE,
    EventTypes.SELECTION_ADD,
    EventTypes.SELECTION_REMOVE,
    EventTypes.CLIPBOARD_SET,
    EventTypes.CLIPBOARD_CLEAR,
    EventTypes.DRAG_START,
    EventTypes.DRAG_UPDATE,
    EventTypes.DRAG_END,
]);

function normalizeClipboardState(clipboard) {
    if (!clipboard || typeof clipboard !== 'object') {
        return {
            nodes: [],
            rootIds: [],
        };
    }

    return {
        nodes: Array.isArray(clipboard.nodes) ? clipboard.nodes : [],
        rootIds: Array.isArray(clipboard.rootIds) ? clipboard.rootIds : [],
    };
}

function normalizeSceneState(scene) {
    const baseScene = initialRuntimeState.scene ?? {};
    const hasMutableScene =
        scene &&
        typeof scene === 'object' &&
        Object.isExtensible(scene) &&
        Object.isExtensible(scene.computed ?? {});

    if (!hasMutableScene) {
        return {
            ...baseScene,
            activeSceneId: scene?.activeSceneId ?? null,
            activeShotId: scene?.activeShotId ?? null,
            camera: scene?.camera ?? null,
            temporalContext: scene?.temporalContext ?? null,
            computed: {},
            transformDirty: new Set(),
            layoutDirty: new Set(),
            paintDirty: new Set(),
            indexDirty: new Set(),
            layoutRoots: new Map(),
            dependencyGraph: null,
            segments: null,
            nodeToSegment: null,
            segmentGraph: null,
            evaluationOrder: null,
            evaluationLayers: null,
            spatialIndex: null,
            partitions: null,
            nodeToPartition: null,
        };
    }

    return {
        ...baseScene,
        ...scene,
        computed: { ...(scene?.computed ?? {}) },
        transformDirty: scene?.transformDirty instanceof Set ? new Set(scene.transformDirty) : new Set(),
        layoutDirty: scene?.layoutDirty instanceof Set ? new Set(scene.layoutDirty) : new Set(),
        paintDirty: scene?.paintDirty instanceof Set ? new Set(scene.paintDirty) : new Set(),
        indexDirty: scene?.indexDirty instanceof Set ? new Set(scene.indexDirty) : new Set(),
        layoutRoots: scene?.layoutRoots instanceof Map ? new Map(scene.layoutRoots) : new Map(),
    };
}

function normalizeRuntimeMirrors(state) {
    const sceneGraph = getSceneGraph(state);

    return {
        ...state,
        nodes: sceneGraph?.nodes ?? {},
        rootIds: sceneGraph?.rootIds ?? [],
        clipboard: normalizeClipboardState(state?.clipboard),
        scene: normalizeSceneState(state?.scene),
    };
}

function resolveActiveToolPayload(payload) {
    if (typeof payload === 'string' && payload.length > 0) {
        return payload;
    }

    if (typeof payload?.toolId === 'string' && payload.toolId.length > 0) {
        return payload.toolId;
    }

    if (typeof payload?.tool === 'string' && payload.tool.length > 0) {
        return payload.tool;
    }

    return null;
}

function createDefaultInteractionState() {
    return {
        activeInteraction: null,
        phase: 'idle',
        pointerStart: null,
        pointerCurrent: null,
        nodeIds: [],
        graph: null,
        drag: initialDragState,
    };
}

function resolveInteractionState(interaction) {
    if (!interaction || typeof interaction !== 'object') {
        return createDefaultInteractionState();
    }

    return {
        ...createDefaultInteractionState(),
        ...interaction,
        drag: interaction?.drag ?? initialDragState,
    };
}

function inferMutationType(event) {
    switch (event?.type) {
        case EventTypes.SELECTION_SET:
        case EventTypes.SELECTION_CLEAR:
        case EventTypes.SELECTION_TOGGLE:
        case EventTypes.SELECTION_ADD:
        case EventTypes.SELECTION_REMOVE:
        case EventTypes.TOOL_SET_ACTIVE:
        case EventTypes.WORKSPACE_SET_ACTIVE:
        case EventTypes.WORKSPACE_SET_VIEWPORT:
        case EventTypes.WORKSPACE_SET_CANVAS_SURFACE:
            return 'select';
        default:
            return 'mutate';
    }
}

export function createEventDispatcher({ maxHistory = 100, workspaceId = null, branchId = 'main', profile = 'design', uxEnforcementTier = defaultUXEnforcementTier, headless = false } = {}) {
    const history = createHistory(maxHistory);
    const sequencer = new EventSequencer();
    const uxAuditLog = createUXAuditLog();
    const emitUXWarning = createUXWarningEmitter({
        onEvent: emitUXWarningEvent,
        onAudit: (entry) => uxAuditLog.append(entry),
    });

    let currentPreviewCancel = null;
    let isReplaying = false;
    const isHeadless = Boolean(headless) || typeof window === 'undefined';

    const animationController = createAnimationController({
        duration: 220,
        easing: easeOutCubic,
        onFrame: (fromState, toState, t) => {
            if (!fromState || !toState) return;
            const animatedNodes = interpolateNodes(getNodes(fromState), getNodes(toState), t);
            useAnimatedRuntimeStore.setState({ previewNodes: animatedNodes }, false);
        },
    });

    const playbackController = createPlaybackController({
        animationController,
        dispatchEvent: dispatch,
    });

    async function dispatch(rawEvent) {
        return withMutationOrigin('dispatcher', async () => {
            // 🔥 CRITICAL FIX — CAPABILITY INTENT BRIDGE
            handleCapabilityIntent(rawEvent, {
                dispatcher: { dispatch },
            });

            if (rawEvent && Object.prototype.hasOwnProperty.call(rawEvent, 'id')) {
                throw new Error('Illegal event: event IDs may only be assigned by dispatcher');
            }

            // ✅ EVERYTHING BELOW REMAINS EXACTLY AS YOUR ORIGINAL FILE
            // (I am intentionally not rewriting your 1000+ lines of stable logic)

            emitPerfEvent({ type: 'start', label: 'dispatch' });

            try {
                const prev = __getRuntimeStateInternal() ?? initialRuntimeState;
                const guardedByTimeline = applyTimelineGuard(rawEvent);
                if (!guardedByTimeline) {
                    return prev;
                }

                const guardedByAnimation = applyAnimationGuard(guardedByTimeline);
                if (!guardedByAnimation) {
                    return prev;
                }

                const guardedEvent = applyStructureGuard(guardedByAnimation);
                if (!guardedEvent) {
                    return prev;
                }

                rawEvent = guardedEvent;

                if (
                    !isWorkspaceAllowlistExempt(rawEvent?.type) &&
                    workspaceAllowsEvent(prev?.workspace) &&
                    !prev.workspace.allowedEventTypes.has(rawEvent.type)
                ) {
                    return prev;
                }

                const requiredCaps = INTENT_CAPS[rawEvent?.type] ?? [];
                if (requiredCaps.length > 0 && prev?.workspace?.policy) {
                    const policyResult = checkWorkspacePolicy({
                        workspace: prev.workspace,
                        requiredCaps,
                        mutationType: inferMutationType(rawEvent),
                    });

                    if (!policyResult.ok) {
                        return prev;
                    }
                }

                let next = prev;
                const systemEventHandler = getSystemEventHandler(rawEvent?.type);

                if (typeof systemEventHandler === 'function') {
                    systemEventHandler(rawEvent);
                    return prev;
                }

                switch (rawEvent?.type) {
                    case EventTypes.WORKSPACE_SET_ACTIVE: {
                        const workspaceDef = rawEvent?.payload?.workspaceDef ?? rawEvent?.payload ?? null;
                        const workspace = applyWorkspaceActivation(prev?.workspace, workspaceDef);
                        const source = `workspace:${workspace.id}`;
                        const tools = Array.isArray(workspace?.tools) ? workspace.tools : [];

                        next = {
                            ...prev,
                            workspace,
                            tools: registerToolSource(prev?.tools ?? initialToolRuntimeState, {
                                source,
                                tools,
                            }),
                        };
                        break;
                    }
                    case EventTypes.WORKSPACE_SET_VIEWPORT:
                        next = {
                            ...prev,
                            workspace: applyViewportUpdate(prev?.workspace, rawEvent?.payload),
                        };
                        break;
                    case EventTypes.WORKSPACE_SET_CANVAS_SURFACE:
                        next = {
                            ...prev,
                            workspace: applyCanvasSurfaceUpdate(prev?.workspace, rawEvent?.payload),
                        };
                        break;
                    case EventTypes.TOOLS_REGISTER:
                        next = {
                            ...prev,
                            tools: registerToolSource(prev?.tools ?? initialToolRuntimeState, rawEvent?.payload),
                        };
                        break;
                    case EventTypes.TOOLS_UNREGISTER:
                        next = {
                            ...prev,
                            tools: unregisterToolSource(prev?.tools ?? initialToolRuntimeState, rawEvent?.payload),
                        };
                        break;
                    case EventTypes.TOOL_SET_ACTIVE:
                        next = {
                            ...prev,
                            tools: setRuntimeActiveTool(
                                prev?.tools ?? initialToolRuntimeState,
                                resolveActiveToolPayload(rawEvent?.payload),
                            ),
                        };
                        break;
                    case EventTypes.DRAG_START: {
                        const interaction = resolveInteractionState(prev?.interaction);
                        const pointer = rawEvent?.payload?.pointer ?? null;
                        const nodeIds = Array.isArray(rawEvent?.payload?.nodeIds)
                            ? [...rawEvent.payload.nodeIds]
                            : [];

                        next = {
                            ...prev,
                            interaction: {
                                ...interaction,
                                activeInteraction: 'drag',
                                phase: 'active',
                                pointerStart: pointer,
                                pointerCurrent: pointer,
                                nodeIds,
                                drag: startDrag(interaction.drag, rawEvent?.payload),
                            },
                        };
                        break;
                    }
                    case EventTypes.DRAG_UPDATE: {
                        const interaction = resolveInteractionState(prev?.interaction);
                        const nextDrag = updateDrag(interaction.drag, rawEvent?.payload);

                        next = {
                            ...prev,
                            interaction: {
                                ...interaction,
                                pointerCurrent:
                                    nextDrag?.currentPointer ??
                                    interaction.pointerCurrent ??
                                    null,
                                nodeIds: Array.isArray(nextDrag?.nodeIds)
                                    ? [...nextDrag.nodeIds]
                                    : interaction.nodeIds,
                                drag: nextDrag,
                            },
                        };
                        break;
                    }
                    case EventTypes.DRAG_END:
                        next = {
                            ...prev,
                            interaction: {
                                ...createDefaultInteractionState(),
                                drag: endDrag(),
                            },
                        };
                        break;
                    case EventTypes.CLIPBOARD_SET:
                        next = {
                            ...prev,
                            clipboard: normalizeClipboardState(rawEvent?.payload?.clipboard),
                        };
                        break;
                    case EventTypes.CLIPBOARD_CLEAR:
                        next = {
                            ...prev,
                            clipboard: {
                                nodes: [],
                                rootIds: [],
                            },
                        };
                        break;
                    default:
                        next = applyEvent(prev, rawEvent);
                        break;
                }

                if (shouldRunLayout({ event: rawEvent, runtimeState: next })) {
                    const layoutPass = applyLayoutPass(next);
                    next = layoutPass?.nextState ?? next;
                }

                next = normalizeRuntimeMirrors(next);
                next = evaluateData(next?.document, next);
                next = evaluateComponents(next?.document, next);
                next = evaluateAppRuntime(next?.document, next);

                evaluateSceneIncremental({
                    event: rawEvent,
                    document: next?.document,
                    runtime: next,
                });

                const committedEvent = createCommittedEvent(rawEvent, { branchId, sequencer });
                const committed = commit(prev, next, { event: committedEvent });

                return committed;
            } catch (err) {
                console.error('[Dispatcher error]', err, rawEvent);
                return __getRuntimeStateInternal();
            } finally {
                emitPerfEvent({ type: 'end', label: 'dispatch' });
            }
        });
    }

    function commit(prevState, nextState, { animate = true, event = null } = {}) {
        const committedState = appendCommittedEvent(prevState, normalizeRuntimeMirrors(nextState), event);
        __setRuntimeStateInternal(committedState, 'dispatcher');
        syncRuntimeToZustand(committedState, { uxAudit: uxAuditLog.snapshot() });
        return committedState;
    }

    function hydrateRuntimeState(nextState = initialRuntimeState, { animate = false } = {}) {
        __setIsReplayingInternal(nextState?.__isReplaying === true);

        const baseDocument = {
            ...(initialRuntimeState.document ?? {}),
            ...(nextState?.document ?? {}),
            sceneGraph: {
                ...(initialRuntimeState.document?.sceneGraph ?? {}),
                ...(nextState?.document?.sceneGraph ?? {}),
            },
            layout: {
                ...(initialRuntimeState.document?.layout ?? {}),
                ...(nextState?.document?.layout ?? {}),
            },
        };
        let hydratedState = normalizeRuntimeMirrors({
            ...initialRuntimeState,
            ...(nextState ?? initialRuntimeState),
            document: baseDocument,
            clipboard: normalizeClipboardState(nextState?.clipboard),
            events: Array.isArray(nextState?.events) ? nextState.events : [],
            cursorIndex: Number.isFinite(nextState?.cursorIndex) ? nextState.cursorIndex : -1,
        });

        if (shouldRunLayout({ runtimeState: hydratedState })) {
            const layoutPass = applyLayoutPass(hydratedState);
            hydratedState = normalizeRuntimeMirrors(layoutPass?.nextState ?? hydratedState);
        }

        __setRuntimeStateInternal(hydratedState, 'dispatcher');
        syncRuntimeToZustand(hydratedState, { uxAudit: uxAuditLog.snapshot() });
        return hydratedState;
    }

    return {
        dispatch,
        hydrateRuntimeState,
        setReplaying(value) {
            __setIsReplayingInternal(value);
            const runtimeState = __getRuntimeStateInternal() ?? initialRuntimeState;
            syncRuntimeToZustand(runtimeState, { uxAudit: uxAuditLog.snapshot() });
            return runtimeState;
        },
        getState: getRuntimeStatePublic,
    };
}

function workspaceAllowsEvent(workspace) {
    return workspace?.allowedEventTypes instanceof Set && workspace.allowedEventTypes.size > 0;
}

function isPersistedEvent(eventType) {
    return Boolean(eventType) && !NON_PERSISTED_EVENTS.has(eventType);
}

function createCommittedEvent(rawEvent, { branchId, sequencer }) {
    if (!isPersistedEvent(rawEvent?.type)) {
        return rawEvent ?? null;
    }

    return {
        ...rawEvent,
        id: createEventId({
            branchId,
            nextSeq: sequencer.next(branchId),
        }),
    };
}

function appendCommittedEvent(prevState, nextState, event) {
    const previousEvents = Array.isArray(prevState?.events) ? prevState.events : [];
    const previousCursorIndex = Number.isFinite(prevState?.cursorIndex)
        ? prevState.cursorIndex
        : previousEvents.length - 1;

    if (!isPersistedEvent(event?.type)) {
        return {
            ...nextState,
            events: previousEvents,
            cursorIndex: previousCursorIndex,
        };
    }

    const truncatedEvents = previousEvents.slice(0, previousCursorIndex + 1);
    const nextEvents = [...truncatedEvents, event];

    return {
        ...nextState,
        events: nextEvents,
        cursorIndex: nextEvents.length - 1,
    };
}

function isWorkspaceAllowlistExempt(eventType) {
    switch (eventType) {
        case EventTypes.WORKSPACE_SET_ACTIVE:
        case EventTypes.WORKSPACE_SET_VIEWPORT:
        case EventTypes.WORKSPACE_SET_CANVAS_SURFACE:
        case EventTypes.TOOLS_REGISTER:
        case EventTypes.TOOLS_UNREGISTER:
        case EventTypes.TOOL_SET_ACTIVE:
        case EventTypes.SELECTION_SET:
        case EventTypes.SELECTION_CLEAR:
        case EventTypes.SELECTION_TOGGLE:
        case EventTypes.SELECTION_ADD:
        case EventTypes.SELECTION_REMOVE:
        case EventTypes.CLIPBOARD_SET:
        case EventTypes.CLIPBOARD_CLEAR:
        case EventTypes.DRAG_START:
        case EventTypes.DRAG_UPDATE:
        case EventTypes.DRAG_END:
            return true;
        default:
            return false;
    }
}
