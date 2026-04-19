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

function EditorWorkspaceLayoutInner({
    adapter,
    events,
    cursor,
    emit,
    documentName,
    onSave,
    onSaveAs,
    recentDocs,
    onOpenDocument,
    canPersist = true,
    onImportJSONReplace,
    onImportJSONMerge,
    onImportSVGReplace,
    onImportSVGMerge,
    canImport = true,
    onOpenTemplateGenerator,
    educationReadOnly = false,
    readOnly = false,
    documentRole = null,
    documentId = null,
    reviewSubmission,
    reviewRubric,
    onReviewDecision,
    onReviewCriteriaChange,
    reviewerId,
    presence,
    railOffset = 0,
}) {
    const { selectedIds, setSelection } = useSelection();

    const keyboardEnabled = adapter?.interactions?.keyboard !== false && adapter?.ui?.editing !== false && adapter?.id !== 'review' && !readOnly;

    const hintMode = adapter?.id === 'design' ? 'graphic' : adapter?.id;

    const hint = useModeOnboarding(hintMode);
    const mode = useMode();

    const { open: commandOpen, close: commandClose } = useCommandPalette({
        enabled: keyboardEnabled,
    });

    const galleryIdentity = useGalleryIdentity();
    const publishToServer = usePublishToServer();

    const workspaceId = adapter?.workspaceId || adapter?.id || 'graphic';

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
            }),
        [emit, events, cursor.index, replayNodes, selectedIds, selected, hintMode, mode, publishToServer, workspaceId],
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
        });
        return () => unregister?.();
    }, [workspaceId]);

    return (
        <div className='workspace-root' style={railOffset > 0 ? { paddingLeft: railOffset } : undefined}>
            <PresenceDots presence={presence} />

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

            <TopBar modeLabel={adapter.label} />

            {adapter?.id === 'education' ? (
                <EducationToolbar emit={emit} cursor={cursor} events={events} readOnly={educationReadOnly} />
            ) : adapter?.id === 'review' ? (
                <ReviewToolbar submission={reviewSubmission} onDecision={onReviewDecision} reviewerId={reviewerId} cursor={cursor} />
            ) : readOnly ? null : (
                <Toolbar mode={adapter} emit={emit} getState={getState} events={events} cursor={cursor} documentName={documentName} onSave={onSave} onSaveAs={onSaveAs} recentDocs={recentDocs} onOpenDocument={onOpenDocument} canPersist={canPersist} />
            )}

            <div className='workspace-main'>
                <LeftPanel panels={adapter.panels?.left} />

                <WorkspaceCanvasRoot workspaceId={workspaceId} />

                <RightPanel panels={adapter.panels?.right} events={events} cursor={cursor} emit={emit} rubric={reviewRubric} reviewCriteria={reviewSubmission?.review?.criteria} onReviewCriteriaChange={onReviewCriteriaChange} submissionId={reviewSubmission?.id} documentId={documentId} />
            </div>

            {/* ✅ FINAL FIX HERE */}
            <TimelineBar events={events} cursor={cursor} submissionId={reviewSubmission?.id} emit={emit} />

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
