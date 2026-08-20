'use client';

import '@/ui/styles/uiux.css';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';

import { PanelRenderer } from '@/ui/workspace/shell/PanelRenderer.jsx';
import { WorkspaceSessionsRoot } from '@/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';

import { nodeUpdateIntent } from '@/ui/inspector/nodeUpdateIntent.js';
import { useWorkspaceProjectionState, useWorkspaceViewState, useWorkspaceVisualState } from '@/runtime/projection';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';
import { openTemplatePublishDialog } from '@/ui/bridges/templatePublishRuntimeFacade.js';
import { PersistenceBridge } from '@/ui/bridges/PersistenceBridge.jsx';
import { TokenCssBridge } from '@/ui/bridges/tokenCssBridge.js';
import { UIUXTransitionTimelinePanel } from './UIUXTransitionTimelinePanel.jsx';
import { useKeyboardNudge } from '@/ui/keyboard/useKeyboardNudge';
import { useAlignmentShortcuts } from '@/ui/keyboard/useAlignmentShortcuts';
import { useGroupShortcuts } from '@/ui/keyboard/useGroupShortcuts.js';
import { RuntimeDispatchRelay } from '@/runtime/boundary/RuntimeDispatchRelay.jsx';
import { dispatchNodeDeleteSelection } from '@/ui/canvas/deleteSelection.js';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import { hasTimelineRelevance } from '@/runtime/timeline/timelineRelevance.js';
import { historyIntentUndo, historyIntentRedo } from '@/ui/history/historyIntent.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { viewportIntent } from '@/ui/viewport/viewportIntent.js';
import {
    attachMotionClipToNode,
    getMotionClipsForNode,
    removeMotionClipsFromNode,
} from '@/ui/motion/motionClipActions.js';
import { getVisibleToolsForWorkspace } from '@/ui/tools/toolDefinitions.js';
import {
    resolveDesignWorkspaceContext,
    buildDesignPublishModePayload,
    resolveDesignModeCapabilitySurface,
    DesignWorkspaceStrip,
} from '@/ui/workspace/design/DesignShellPrimitives.jsx';
import { hasProjectHistory, resolveProjectHomeViewport } from '@/runtime/workspaces/projectSubstrateNavigation.js';
import { getUIUXCreationEntries } from './uiuxLanguageDictionary.js';
import {
    UIUX_SCENARIO_OPTIONS,
    resolveUIUXScenarioProvision,
} from './uiuxScenarioProvision.js';
import { resolveUIUXFirstExpressionProjection } from './uiuxFirstExpressionProjection.js';
import { useWorkspaceSession } from '@/ui/workspace/session/WorkspaceSessionContext.jsx';

const SCENARIO_SELECTION_STORAGE_PREFIX = 'dropple.uiux.scenario-selection';
const EMPTY_NODE_MAP = Object.freeze({});
const EMPTY_TOOL_IDS = Object.freeze([]);
const DEFAULT_VIEWPORT = Object.freeze({ x: 0, y: 0, scale: 1 });
const UIUX_CREATE_TOOL_HINTS = Object.freeze({
    frame: 'Frame is active. Click or drag on the canvas to place a new Frame.',
    text: 'Text is active. Click inside a selected Frame to place Text.',
    shape: 'Shape is active. Click inside a selected Frame to place a Shape.',
    image: 'Image is active. Click inside a selected Frame to place an Image.',
});

function buildScenarioSelectionStorageKey(documentId) {
    return `${SCENARIO_SELECTION_STORAGE_PREFIX}:${documentId || 'unknown'}`;
}

export function UIUXAuthoringShell({
    ...props
}) {
    return (
        <RuntimeDispatchRelay>
            {(dispatcher) => <UIUXAuthoringShellContent dispatcher={dispatcher} {...props} />}
        </RuntimeDispatchRelay>
    );
}

function UIUXAuthoringShellContent({
    profile = 'uiux-authoring',
    modeId = 'uiux',
    workspaceContext = null,
    initialEnvironmentDescriptor = null,
    initialResolvedTemplateEnvironment = null,
    initialRuntimeSnapshot = null,
    initialEvents = [],
    initialCursorIndex = -1,
    initialDocumentId = null,
    dispatcher = null,
}) {
    const emit = useCallback((event) => nodeUpdateIntent(event), []);
    const workspaceSession = useWorkspaceSession();
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');
    const [dismissedFirstExpressionNodeId, setDismissedFirstExpressionNodeId] = useState(null);

    const resolvedDesignContext = resolveDesignWorkspaceContext({ modeId, workspaceContext });
    const resolvedModeId = resolvedDesignContext.modeId;
    const resolvedWorkspaceId = resolvedDesignContext.workspaceId;
    const publishModePayload = buildDesignPublishModePayload(resolvedDesignContext);
    const capabilitySurface = resolveDesignModeCapabilitySurface(resolvedModeId);

    const { capabilities } = useWorkspaceCapabilities({
        workspace: resolvedWorkspaceId,
        mode: resolvedModeId,
    });

    useCapabilityLifecycle({
        capabilities,
        emit,
        workspace: resolvedWorkspaceId,
        mode: resolvedModeId,
    });

    const nodes = useWorkspaceVisualState((s) => s.nodes || {});
    const selectedIds = useWorkspaceVisualState((s) => s.selection?.ids || []);
    const activeTool = useWorkspaceProjectionState((s) => s.tools?.activeTool ?? null);
    const workspaceDocument = useWorkspaceProjectionState((s) => s.document ?? null);
    const documentNodes = useWorkspaceProjectionState((s) => s.document?.sceneGraph?.nodes ?? s?.nodes ?? EMPTY_NODE_MAP);
    const visibleTools = useWorkspaceProjectionState((s) => s.tools?.visibleTools ?? EMPTY_TOOL_IDS);
    const viewport = useWorkspaceViewState((s) => s.viewport ?? DEFAULT_VIEWPORT);
    const worldHistory = useWorkspaceProjectionState((s) => s.document?.world?.history ?? null);
    const nodeCount = useMemo(() => Object.keys(nodes ?? {}).length, [nodes]);
    const runtimeDocumentId = workspaceDocument?.meta?.id ?? initialDocumentId ?? null;
    const [explicitScenarioSelections, setExplicitScenarioSelections] = useState({});
    const createItems = useMemo(() => {
        const availableToolIds =
            Array.isArray(visibleTools) && visibleTools.length > 0
                ? visibleTools
                : getVisibleToolsForWorkspace({
                      workspaceId: resolvedModeId,
                      modeId: resolvedModeId,
                  }).map((tool) => tool.id);

        return getUIUXCreationEntries({ availableToolIds }).map((entry) => ({
                toolId: entry.creation.toolId,
                label: entry.creation.railLabel || entry.label,
            }));
    }, [resolvedModeId, visibleTools]);

    const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
    const node = selectedId ? documentNodes?.[selectedId] ?? nodes?.[selectedId] ?? null : null;
    const selectionCount = selectedIds.length;
    const selectedNodeClips = getMotionClipsForNode(workspaceDocument, node?.id ?? null);
    const hasMotionForSelectedNode = selectedNodeClips.length > 0;
    const hasInspectableContext = Boolean(node?.id);
    const hasTimeAuthoringContext = hasTimelineRelevance({
        capabilitySurface,
        document: workspaceDocument,
        selectedNode: node,
        activeTool,
    });
    const timelineState = hasTimeAuthoringContext ? 'expanded' : 'compact';
    const firstExpressionFocusState = useMemo(
        () =>
            resolveUIUXFirstExpressionProjection({
                workspaceId: resolvedWorkspaceId,
                modeId: resolvedModeId,
                nodeCount: Object.keys(nodes ?? {}).length,
                nodesById: nodes,
                selectedNode: node,
                dismissedNodeId: dismissedFirstExpressionNodeId,
            }),
        [dismissedFirstExpressionNodeId, node, nodes, resolvedModeId, resolvedWorkspaceId],
    );
    const isFirstExpressionFocus = Boolean(firstExpressionFocusState?.node?.id);
    const isCreativeInitiationFocus =
        !hasProjectHistory({
            workspaceId: resolvedWorkspaceId,
            modeId: resolvedModeId,
            nodeCount,
            worldHistory,
        }) && !isFirstExpressionFocus;
    const isAuthoringReady = !isCreativeInitiationFocus && !isFirstExpressionFocus;
    const showInspector = hasInspectableContext && !isFirstExpressionFocus;
    const showTimeline = hasTimeAuthoringContext && !isFirstExpressionFocus;
    const showStatusStrip = !isFirstExpressionFocus && (selectionCount > 0 || (showTimeline && node?.id));
    const activeCreateToolHint = isAuthoringReady ? UIUX_CREATE_TOOL_HINTS[activeTool] ?? null : null;
    useEffect(() => {
        if (!dismissedFirstExpressionNodeId) return;
        if (!node?.id) return;
        if (node.id === dismissedFirstExpressionNodeId) return;
        setDismissedFirstExpressionNodeId(null);
    }, [dismissedFirstExpressionNodeId, node?.id]);

    useEffect(() => {
        if (typeof window === 'undefined' || !runtimeDocumentId) return;

        try {
            const raw = window.localStorage.getItem(buildScenarioSelectionStorageKey(runtimeDocumentId));
            if (!raw) {
                setExplicitScenarioSelections({});
                return;
            }

            const parsed = JSON.parse(raw);
            setExplicitScenarioSelections(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
        } catch {
            setExplicitScenarioSelections({});
        }
    }, [runtimeDocumentId]);

    useEffect(() => {
        if (typeof window === 'undefined' || !runtimeDocumentId) return;

        try {
            window.localStorage.setItem(
                buildScenarioSelectionStorageKey(runtimeDocumentId),
                JSON.stringify(explicitScenarioSelections ?? {}),
            );
        } catch {
            // fail closed: non-explicit providers continue to work
        }
    }, [explicitScenarioSelections, runtimeDocumentId]);

    const explicitScenarioForSelection = selectedId ? explicitScenarioSelections[selectedId] ?? null : null;
    const resolvedScenarioProvision = useMemo(
        () =>
            resolveUIUXScenarioProvision({
                explicitScenario: explicitScenarioForSelection,
                node,
                document: workspaceDocument,
                workspaceContext,
            }),
        [explicitScenarioForSelection, node, workspaceContext, workspaceDocument],
    );

    useKeyboardNudge({
        enabled: true,
        emit,
        getState: () => ({ nodes }),
        selectedIds,
    });

    useAlignmentShortcuts({
        enabled: true,
        emit,
        getState: () => ({ nodes }),
        selectedIds,
    });

    useGroupShortcuts({
        enabled: true,
        emit,
        getState: () => ({ nodes }),
        selectedIds,
        workspaceId: resolvedModeId,
        modeId: resolvedModeId,
        dispatcher,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handleKeyDown = (event) => {
            const target = event.target;
            const tagName = typeof target?.tagName === 'string' ? target.tagName.toLowerCase() : '';
            const isTextInput =
                tagName === 'input' ||
                tagName === 'textarea' ||
                target?.isContentEditable === true;

            if (isTextInput) return;
            const isMac = navigator.platform.includes('Mac');
            const mod = isMac ? event.metaKey : event.ctrlKey;

            if (mod && event.key.toLowerCase() === 'z' && !event.shiftKey) {
                event.preventDefault();
                historyIntentUndo();
                return;
            }

            if (mod && event.key.toLowerCase() === 'z' && event.shiftKey) {
                event.preventDefault();
                historyIntentRedo();
                return;
            }

            if (selectedIds.length === 0) return;
            if (event.key !== 'Delete' && event.key !== 'Backspace') return;

            event.preventDefault();
            dispatchNodeDeleteSelection({
                ids: selectedIds,
                dispatchEvent: dispatcher.dispatch,
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatcher, selectedIds]);

    const handleActivateTool = useCallback(
        (toolId) => {
            if (!toolId) return;
            if (toolId === 'select' && isFirstExpressionFocus && firstExpressionFocusState?.node?.id) {
                setDismissedFirstExpressionNodeId(firstExpressionFocusState.node.id);
            }
            canvasBus.emit(INTENTS.TOOL_SET_ACTIVE, {
                toolId,
                workspaceId: resolvedModeId,
            });
        },
        [firstExpressionFocusState?.node?.id, isFirstExpressionFocus, resolvedModeId],
    );

    const handleDeleteSelection = useCallback(() => {
        if (selectedIds.length === 0) return;
        dispatchNodeDeleteSelection({
            ids: selectedIds,
            dispatchEvent: dispatcher.dispatch,
        });
    }, [dispatcher.dispatch, selectedIds]);

    const handleGroupSelection = useCallback(() => {
        runCommandIntent('group', { nodeIds: selectedIds }, { dispatcher, workspaceId: resolvedModeId, modeId: resolvedModeId });
    }, [dispatcher, resolvedModeId, selectedIds]);

    const handleUngroupSelection = useCallback(() => {
        runCommandIntent('ungroup', { nodeIds: selectedIds }, { dispatcher, workspaceId: resolvedModeId, modeId: resolvedModeId });
    }, [dispatcher, resolvedModeId, selectedIds]);

    const handleAttachMotion = useCallback(() => {
        attachMotionClipToNode(dispatcher.dispatch, node?.id ?? null);
    }, [dispatcher.dispatch, node?.id]);

    const handleRemoveMotion = useCallback(() => {
        removeMotionClipsFromNode(dispatcher.dispatch, node?.id ?? null, selectedNodeClips);
    }, [dispatcher.dispatch, node?.id, selectedNodeClips]);

    const handleScenarioSelectionChange = useCallback(
        (scenario) => {
            if (!selectedId) return;

            setExplicitScenarioSelections((current) => {
                const next = { ...(current ?? {}) };
                if (scenario) {
                    next[selectedId] = scenario;
                } else {
                    delete next[selectedId];
                }
                return next;
            });
        },
        [selectedId],
    );

    const languagePanelProps = useMemo(
        () => ({
            UIUXLanguageProjectionPanel: {
                document: workspaceDocument,
                workspaceContext,
                scenarioProvision: resolvedScenarioProvision,
                scenarioOptions: UIUX_SCENARIO_OPTIONS,
                onScenarioChange: handleScenarioSelectionChange,
            },
        }),
        [handleScenarioSelectionChange, resolvedScenarioProvision, workspaceContext, workspaceDocument],
    );

    const handleReturnHome = useCallback(() => {
        if (typeof window === 'undefined') return;

        const host = window.document.querySelector('[data-testid="canvas-host"]');
        if (!host) return;

        const rect = host.getBoundingClientRect();
        if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const nextViewport = resolveProjectHomeViewport({
            workspaceId: resolvedModeId,
            hostRect: {
                width: rect.width,
                height: rect.height,
            },
            scale: viewport?.scale ?? 1,
            viewport,
        });

        if (!nextViewport) return;
        viewportIntent({ viewport: nextViewport });
    }, [resolvedModeId, viewport]);

    return (
        <>
            <TokenCssBridge />

            <PersistenceBridge
                enabled={true}
                initialDocumentId={initialDocumentId}
                initialEnvironmentDescriptor={initialEnvironmentDescriptor}
                initialResolvedTemplateEnvironment={initialResolvedTemplateEnvironment}
                initialRuntimeSnapshot={initialRuntimeSnapshot}
                initialEvents={initialEvents}
                initialCursorIndex={initialCursorIndex}
                documentId={documentId}
                documentName={documentName}
                onDocumentIdChange={setDocumentId}
                onDocumentNameChange={setDocumentName}
                workspace='design'
                mode={resolvedModeId}
            />
            <div style={{ display: 'none' }} data-workspace-grammar={workspaceSession.grammar ?? ''} />

            <div
                className='uiux-root'
                data-workspace={resolvedModeId}
                data-testid='uiux-world-editor'
                data-editor-unity='world-based'
                data-editor-focus={selectionCount > 0 ? 'focused' : 'open'}
                data-creative-initiation-focus={isCreativeInitiationFocus ? 'true' : 'false'}
                data-first-expression-focus={isFirstExpressionFocus ? 'true' : 'false'}
                data-authoring-ready={isAuthoringReady ? 'true' : 'false'}
                data-active-create-tool={activeCreateToolHint ? 'true' : 'false'}
                data-active-create-tool-id={activeCreateToolHint ? activeTool : ''}>
                <div
                    className='uiux-main-grid'
                    data-testid='uiux-main-grid'
                    data-editor-cohesion='create-world'
                    data-canvas-priority='primary'
                    data-inspector-visibility={showInspector ? 'visible' : 'hidden'}>
                    <main className='uiux-canvas-dock' data-testid='uiux-canvas-dock'>
                        <div className='uiux-floating-controls' data-testid='uiux-floating-controls'>
                            <UIUXTopBar
                                onUndo={historyIntentUndo}
                                onRedo={historyIntentRedo}
                                createItems={createItems}
                                onDelete={handleDeleteSelection}
                                onGroup={handleGroupSelection}
                                onUngroup={handleUngroupSelection}
                                onAttachMotion={handleAttachMotion}
                                onRemoveMotion={handleRemoveMotion}
                                onReturnHome={handleReturnHome}
                                onActivateTool={handleActivateTool}
                                canDelete={selectionCount > 0}
                                canGroup={selectionCount > 1}
                                canUngroup={selectionCount === 1 && node?.type === 'group'}
                                canAttachMotion={hasInspectableContext && node?.type !== 'group' && !hasMotionForSelectedNode}
                                canRemoveMotion={hasInspectableContext && node?.type !== 'group' && hasMotionForSelectedNode}
                                onPublish={() =>
                                    openTemplatePublishDialog({
                                        mode: publishModePayload,
                                    })
                                }
                            />
                        </div>

                        <div className='uiux-floating-header' data-testid='uiux-floating-header'>
                            {showStatusStrip ? (
                                <DesignWorkspaceStrip
                                    status='Draft'
                                    selectionCount={selectionCount}
                                    timelineState={timelineState}
                                />
                            ) : null}
                        </div>

                        <aside className='uiux-left-dock' data-testid='uiux-left-dock'>
                            <UIUXToolRail
                                workspaceId={resolvedWorkspaceId}
                                modeId={resolvedModeId}
                                onActivateTool={handleActivateTool}
                                authoringReady={isAuthoringReady}
                            />
                        </aside>

                        {activeCreateToolHint ? (
                            <div
                                className='uiux-create-mode-hint'
                                data-testid='uiux-create-mode-hint'
                                data-tool-id={activeTool}>
                                {activeCreateToolHint}
                            </div>
                        ) : null}

                        <UIUXCanvasStage
                            profile={profile}
                            workspaceId={resolvedModeId}
                            dismissedFirstExpressionNodeId={dismissedFirstExpressionNodeId}
                            onDismissFirstExpression={setDismissedFirstExpressionNodeId}
                            immersiveFirstExpression={isFirstExpressionFocus}
                        />

                        {showInspector ? (
                            <aside className='uiux-right-dock' data-testid='uiux-right-dock'>
                                <PanelRenderer
                                    workspaceId={resolvedModeId}
                                    node={node}
                                    emit={emit}
                                    extraPanels={[]}
                                    panelPropsById={languagePanelProps}
                                />
                            </aside>
                        ) : null}

                        {showTimeline ? (
                            <footer
                                className='uiux-bottom-dock'
                                data-testid='uiux-bottom-dock'
                                data-surface='timeline'
                                data-context-visibility={node?.id ? 'expanded' : 'compact'}>
                                <UIUXTransitionTimelinePanel node={node} />
                            </footer>
                        ) : null}
                    </main>
                </div>

                <WorkspaceSessionsRoot modeId={resolvedModeId} />
            </div>
        </>
    );
}
