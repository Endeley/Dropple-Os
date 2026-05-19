'use client';

import TopBar from '@/ui/layout/TopBar';
import Toolbar from '@/ui/layout/Toolbar';
import LeftPanel from '@/ui/layout/LeftPanel';
import RightPanel from '@/ui/layout/RightPanel';
import TimelineBar from '@/ui/layout/TimelineBar';
import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';
import { EducationToolbar } from '@/education/EducationToolbar';
import ReviewToolbar from '@/review/ReviewToolbar';

import { SelectionProvider, useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { ModeProvider, useMode } from '@/ui/workspace/shared/ModeContext.jsx';

import { useKeyboardShortcuts } from '@/ui/interaction/interaction/useKeyboardShortcuts.js';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';

import { useEffect, useMemo, useCallback } from 'react';

import { registerWorkspaceTools } from '@/ui/interaction/toolRegistration';
import { useKeyboardNudge } from '@/ui/keyboard/useKeyboardNudge';
import { useAlignmentShortcuts } from '@/ui/keyboard/useAlignmentShortcuts';
import { useGroupShortcuts } from '@/ui/keyboard/useGroupShortcuts';

import { useModeOnboarding } from '@/onboarding/useModeOnboarding';
import { ModeHint } from '@/onboarding/ModeHint';

import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
import { buildCommands } from '@/commands/commandRegistry';

import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { usePublishToServer } from '@/gallery/usePublishToServer';

import PresenceDots from '@/collab/PresenceDots';

import { ExportGateOverlay } from '@/ui/export/ExportGateOverlay';
import { getNodes } from '@/runtime/document/documentAdapter.js';

import { UIUXToolRail } from '@/ui/workspace/ux/UIUXToolRail.jsx';
import { WorkspaceSwitcher } from '@/ui/workspace/shared/WorkspaceSwitcher.jsx';
import { ModeSwitcher } from '@/ui/workspace/shared/ModeSwitcher.jsx';
import { useDispatcher } from '@/ui/workspace/DispatcherContext.jsx';
import { dispatchOsWorkspaceShellIntent } from '@/ui/bridges/osSurfaceIntentBridge.js';

function EditorWorkspaceLayoutInner({
    adapter,
    workspaceContext,
    showWorkspaceNavigation,
    onGoToWorkspace,
    onGoToMode,

    events,
    cursor,
    emit,
    exportArtifact,

    documentName,
    onSave,
    onSaveAs,
    recentDocs,
    onOpenDocument,

    canPersist = true,

    canImport = true,
    publicationDescriptor = null,
    publicationResolvedTemplateEnvironment = null,

    onOpenTemplateGenerator,

    educationReadOnly = false,
    isLearningOverlay = false,
    toolModeId = null,
    overlayId = null,
    readOnly = false,

    documentRole = null,
    documentId = null,

    reviewSubmission,
    reviewRubric,
    onReviewDecision,
    onReviewCriteriaChange,
    reviewerId,

    presence,
    capabilitySurfacePanels = [],
}) {
    const dispatcher = useDispatcher();
    const { selectedIds, setSelection } = useSelection();

    const keyboardEnabled = adapter?.interactions?.keyboard !== false && adapter?.ui?.editing !== false && adapter?.id !== 'review' && !readOnly;

    const hintMode = adapter?.id === 'design' ? 'graphic' : adapter?.id;

    const hint = useModeOnboarding(hintMode);
    const mode = useMode();

    const { open: commandOpen, close: commandClose } = useCommandPalette({
        enabled: keyboardEnabled,
    });

    const galleryIdentity = useGalleryIdentity();
    const publishToServer = usePublishToServer({
        descriptor: publicationDescriptor,
        resolvedEnvironment: publicationResolvedTemplateEnvironment,
    });

    const workspaceId = adapter?.workspaceId || adapter?.id || 'graphic';
    const showToolRail = adapter?.ui?.canvas !== false && adapter?.ui?.editing !== false;
    const showSystemVersioningPanels =
        workspaceContext?.workspaceId === 'system' &&
        (toolModeId === 'governance' || overlayId === 'governance') &&
        Array.isArray(capabilitySurfacePanels) &&
        capabilitySurfacePanels.length > 0;

    const getState = useCallback(() => {
        return getDesignStateAtCursor({
            events,
            uptoIndex: cursor.index,
        });
    }, [events, cursor.index]);

    const replayState = useMemo(() => {
        return getState() ?? { nodes: {} };
    }, [getState]);

    const replayNodes = useMemo(() => getNodes(replayState), [replayState]);
    const selected = useMemo(() => {
        if (!selectedIds || selectedIds.size === 0) return [];

        return Array.from(selectedIds)
            .map((id) => replayNodes?.[id])
            .filter(Boolean);
    }, [selectedIds, replayNodes]);

    const commands = useMemo(
        () =>
            buildCommands({
                emit,
                nodes: replayNodes || {},
                selectedIds: selectedIds ? Array.from(selectedIds) : [],
                events,
                cursorIndex: cursor.index,
                selected,
                mode: hintMode || mode,
                workspaceId,
                publishToServer,
                exportArtifact,
            }),
        [emit, events, cursor.index, replayNodes, selectedIds, selected, hintMode, mode, publishToServer, workspaceId, exportArtifact],
    );

    useKeyboardShortcuts({
        enabled: keyboardEnabled,
        selectedIds,
        setSelection,
        emit,
        getState,
    });

    useKeyboardNudge({
        enabled: keyboardEnabled,
        emit,
        getState,
    });

    useAlignmentShortcuts({
        enabled: keyboardEnabled,
        emit,
        getState,
    });

    useGroupShortcuts({
        enabled: keyboardEnabled,
        selectedIds,
        emit,
        getState,
        workspaceId,
    });

    useEffect(() => {
        const unregister = registerWorkspaceTools({
            workspaceId,
            modeId: toolModeId,
            overlayId,
        });
        return () => unregister?.();
    }, [workspaceId, toolModeId, overlayId]);

    const routeWorkspaceSwitch = useCallback(
        (nextWorkspaceId) => {
            dispatchOsWorkspaceShellIntent(
                {
                    action: 'workspace.activate',
                    workspaceId: nextWorkspaceId,
                },
                dispatcher,
            );
            onGoToWorkspace?.(nextWorkspaceId);
        },
        [dispatcher, onGoToWorkspace],
    );

    const routeModeSwitch = useCallback(
        (nextModeId) => {
            const currentWorkspaceId = workspaceContext?.workspaceId ?? workspaceId;
            dispatchOsWorkspaceShellIntent(
                {
                    action: 'mode.activate',
                    workspaceId: currentWorkspaceId,
                    modeId: nextModeId,
                },
                dispatcher,
            );
            onGoToMode?.(currentWorkspaceId, nextModeId);
        },
        [dispatcher, onGoToMode, workspaceContext?.workspaceId, workspaceId],
    );

    return (
        <div className='workspace-root'>
            <PresenceDots presence={presence} />

            {/* Command palette */}
            {commandOpen && (
                <CommandPalette
                    commands={commands}
                    context={{
                        selected,
                        mode: hintMode || mode,
                        readOnly: false,
                        authenticated: !!galleryIdentity,
                    }}
                    onClose={commandClose}
                />
            )}

            {hint && <ModeHint text={hint} />}

            {/* Navigation UI (moved from Shell → correct) */}
            {showWorkspaceNavigation && workspaceContext && (
                <div className='workspace-nav'>
                    <WorkspaceSwitcher activeWorkspace={workspaceContext.workspaceId} onChange={routeWorkspaceSwitch} />
                    <ModeSwitcher workspace={workspaceContext.workspaceId} activeMode={workspaceContext.modeId} onChange={routeModeSwitch} />
                </div>
            )}

            {/* Top bar */}
            <TopBar workspaceLabel={workspaceContext?.workspaceId} modeLabel={adapter.label} documentName={documentName} onSave={onSave} readOnly={readOnly} />

            {/* Toolbar */}
            {isLearningOverlay ? (
                <EducationToolbar emit={emit} cursor={cursor} events={events} readOnly={educationReadOnly} />
            ) : adapter?.id === 'review' ? (
                <ReviewToolbar submission={reviewSubmission} onDecision={onReviewDecision} reviewerId={reviewerId} cursor={cursor} />
            ) : readOnly ? null : (
                <Toolbar mode={adapter} emit={emit} getState={getState} events={events} cursor={cursor} exportArtifact={exportArtifact} documentName={documentName} onSave={onSave} onSaveAs={onSaveAs} recentDocs={recentDocs} onOpenDocument={onOpenDocument} canPersist={canPersist} onOpenTemplateGenerator={onOpenTemplateGenerator} />
            )}

            {/* Main workspace */}
            <div className='workspace-main'>
                {/* Tool rail (correct ownership now) */}
                {showToolRail && <UIUXToolRail />}

                <LeftPanel panels={adapter.panels?.left} events={events} cursor={cursor} workspaceId={workspaceId} />

                <div className='workspace-canvas-cell'>
                    <WorkspaceCanvasRoot workspaceId={workspaceId} />

                    {showSystemVersioningPanels && (
                        <div className='workspace-capability-panels'>
                            {capabilitySurfacePanels.map((CapabilityPanel, index) => (
                                <div
                                    key={`${CapabilityPanel.displayName ?? CapabilityPanel.name ?? 'capability-panel'}-${index}`}
                                    className='workspace-capability-panel'
                                >
                                    <CapabilityPanel />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <RightPanel panels={adapter.panels?.right} events={events} cursor={cursor} emit={emit} capabilities={adapter?.capabilities} rubric={reviewRubric} reviewCriteria={reviewSubmission?.review?.criteria} onReviewCriteriaChange={onReviewCriteriaChange} submissionId={reviewSubmission?.id} documentId={documentId} readOnly={readOnly} />
            </div>

            <TimelineBar events={events} cursor={cursor} submissionId={reviewSubmission?.id} />

            <ExportGateOverlay />
        </div>
    );
}

export function EditorWorkspaceLayout(props) {
    return (
        <SelectionProvider>
            <ModeProvider value={props.adapter?.id || 'graphic'}>
                <EditorWorkspaceLayoutInner {...props} />
            </ModeProvider>
        </SelectionProvider>
    );
}
