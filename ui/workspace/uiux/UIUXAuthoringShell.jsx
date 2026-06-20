'use client';

import '@/ui/styles/uiux.css';
import { useCallback, useEffect, useState } from 'react';

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
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { dispatchNodeDeleteSelection } from '@/ui/canvas/deleteSelection.js';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import { hasTimelineRelevance } from './timelineRelevance.js';
import { historyIntentUndo, historyIntentRedo } from '@/ui/history/historyIntent.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { viewportIntent } from '@/ui/viewport/viewportIntent.js';
import {
    attachMotionClipToNode,
    getMotionClipsForNode,
    removeMotionClipsFromNode,
} from '@/ui/motion/motionClipActions.js';
import {
    resolveDesignWorkspaceContext,
    buildDesignPublishModePayload,
    resolveDesignModeCapabilitySurface,
    DesignWorkspaceStrip,
} from '@/ui/workspace/design/DesignShellPrimitives.jsx';
import { resolveProjectHomeViewport } from '@/runtime/workspaces/projectSubstrateNavigation.js';

export function UIUXAuthoringShell({
    profile = 'uiux-authoring',
    modeId = 'uiux',
    workspaceContext = null,
    initialEnvironmentDescriptor = null,
    initialResolvedTemplateEnvironment = null,
    initialRuntimeSnapshot = null,
    initialEvents = [],
    initialCursorIndex = -1,
    initialDocumentId = null,
}) {
    const createItems = [
        { toolId: 'frame', label: 'Frame' },
        { toolId: 'text', label: 'Text' },
        { toolId: 'image', label: 'Image' },
        { toolId: 'shape', label: 'Shape' },
        { toolId: 'path', label: 'Path' },
    ];
    const emit = useCallback((event) => nodeUpdateIntent(event), []);
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');
    const dispatcher = useDispatcher();

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
    const viewport = useWorkspaceViewState((s) => s.viewport ?? { x: 0, y: 0, scale: 1 });

    const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
    const node = selectedId ? nodes[selectedId] : null;
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
    const showInspector = hasInspectableContext;
    const showTimeline = hasTimeAuthoringContext;
    const showStatusStrip = selectionCount > 0 || (showTimeline && node?.id);

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
            canvasBus.emit(INTENTS.TOOL_SET_ACTIVE, {
                toolId,
                workspaceId: resolvedModeId,
            });
        },
        [resolvedModeId],
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

            <div
                className='uiux-root'
                data-workspace={resolvedModeId}
                data-testid='uiux-world-editor'
                data-editor-unity='world-based'
                data-editor-focus={selectionCount > 0 ? 'focused' : 'open'}>
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
                            <UIUXToolRail modeId={resolvedModeId} />
                        </aside>

                        <UIUXCanvasStage profile={profile} workspaceId={resolvedModeId} />

                        {showInspector ? (
                            <aside className='uiux-right-dock' data-testid='uiux-right-dock'>
                                <PanelRenderer
                                    workspaceId={resolvedModeId}
                                    node={node}
                                    emit={emit}
                                    extraPanels={[]}
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
