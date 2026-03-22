'use client';

import TopBar from '@/ui/layout/TopBar';
import Toolbar from '@/ui/layout/Toolbar';
import PropertyBar from '@/ui/layout/PropertyBar';
import LeftPanel from '@/ui/layout/LeftPanel';
import RightPanel from '@/ui/layout/RightPanel';
import TimelineBar from '@/ui/layout/TimelineBar';
import CanvasStage from '@/ui/layout/CanvasStage';
import { EducationToolbar } from '@/education/EducationToolbar';
import ReviewToolbar from '@/review/ReviewToolbar';
import { SelectionProvider, useSelection } from './SelectionContext';
import { ModeProvider, useMode } from './ModeContext';
import { useKeyboardShortcuts } from '@/ui/interaction/interaction/useKeyboardShortcuts.js';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { registerWorkspaceTools } from '@/ui/interaction/toolRegistration';
import { useKeyboardNudge } from '@/ui/keyboard/useKeyboardNudge';
import { useAlignmentShortcuts } from '@/ui/keyboard/useAlignmentShortcuts';
import { useGroupShortcuts } from '@/ui/keyboard/useGroupShortcuts';
import { useModeOnboarding } from '@/onboarding/useModeOnboarding';
import { ModeHint } from '@/onboarding/ModeHint';
import { FilePicker } from '@/ui/files/FilePicker';
import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
import { buildCommands } from '@/commands/commandRegistry';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { usePublishToServer } from '@/gallery/usePublishToServer';
import PresenceDots from '@/collab/PresenceDots';
import { ExportGateOverlay } from '@/ui/export/ExportGateOverlay';

function WorkspaceLayoutInner({
  adapter,
  events,
  cursor,
  setCursorIndex,
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
  intents,
}) {
  const { selectedIds, setSelection } = useSelection();
  const keyboardEnabled =
    adapter?.interactions?.keyboard !== false &&
    adapter?.ui?.editing !== false &&
    adapter?.id !== 'review' &&
    !readOnly;
  const canManageSharing = documentRole === 'owner' && !readOnly && !!documentId;
  const hintMode = adapter?.id === 'design' ? 'graphic' : adapter?.id;
  const hint = useModeOnboarding(hintMode);
  const mode = useMode();
  const canEmitCursor = !readOnly && (documentRole === 'owner' || documentRole === 'editor');

  const { open: commandOpen, close: commandClose } = useCommandPalette({
    enabled: keyboardEnabled,
  });
  const galleryIdentity = useGalleryIdentity();
  const selfUserId = galleryIdentity?.id ?? null;
  const publishToServer = usePublishToServer();

  const jsonReplaceRef = useRef(null);
  const jsonMergeRef = useRef(null);
  const svgReplaceRef = useRef(null);
  const svgMergeRef = useRef(null);

  const openImportJSONReplace = () => jsonReplaceRef.current?.click();
  const openImportJSONMerge = () => jsonMergeRef.current?.click();
  const openImportSVGReplace = () => svgReplaceRef.current?.click();
  const openImportSVGMerge = () => svgMergeRef.current?.click();

  const undo = useCallback(() => {
    setCursorIndex((current) => {
      if (current < 0) return current;
      const groupId = events[current]?.groupId || events[current]?.id;
      let idx = current;
      while (idx >= 0) {
        const prevGroupId = events[idx]?.groupId || events[idx]?.id;
        if (prevGroupId !== groupId) break;
        idx -= 1;
      }
      return idx;
    });
  }, [events, setCursorIndex]);

  const redo = useCallback(() => {
    setCursorIndex((current) => {
      const start = current + 1;
      if (start >= events.length) return current;
      const groupId = events[start]?.groupId || events[start]?.id;
      let idx = start;
      while (idx + 1 < events.length) {
        const nextGroupId = events[idx + 1]?.groupId || events[idx + 1]?.id;
        if (nextGroupId !== groupId) break;
        idx += 1;
      }
      return idx;
    });
  }, [events, setCursorIndex]);

  const getState = useCallback(() => {
    return getDesignStateAtCursor({
      events,
      uptoIndex: cursor.index,
    });
  }, [events, cursor.index]);

  const replayState = useMemo(() => getState() ?? { nodes: {} }, [getState]);
  const selected = useMemo(() => {
    if (!selectedIds || selectedIds.size === 0) return [];
    return Array.from(selectedIds)
      .map((id) => replayState.nodes?.[id])
      .filter(Boolean);
  }, [selectedIds, replayState.nodes]);

  const commands = useMemo(
    () =>
      buildCommands({
        emit,
        nodes: replayState.nodes || {},
        selectedIds: selectedIds ? Array.from(selectedIds) : [],
        events,
        cursorIndex: cursor.index,
        selected,
        mode: hintMode || mode,
        workspaceId: adapter?.workspaceId || adapter?.id || 'graphic',
        publishToServer,
      }),
    [
      emit,
      events,
      cursor.index,
      replayState.nodes,
      selectedIds,
      selected,
      hintMode,
      mode,
      publishToServer,
    ]
  );

  const baseRightPanels = adapter?.panels?.right || [];
  const rightPanels =
    canManageSharing && !baseRightPanels.includes('SharingPanel')
      ? [...baseRightPanels, 'SharingPanel']
      : baseRightPanels;

  useKeyboardShortcuts({
    enabled: keyboardEnabled,
    selectedIds,
    setSelection,
    emit,
    undo,
    redo,
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
    workspaceId: adapter?.workspaceId || adapter?.id || 'graphic',
  });

  useEffect(() => {
    const unregisterTools = registerWorkspaceTools({
      workspaceId: adapter?.workspaceId || adapter?.id,
    });

    return () => {
      unregisterTools?.();
    };
  }, [adapter?.id, adapter?.workspaceId]);

  return (
    <div className="workspace-root" style={railOffset > 0 ? { paddingLeft: railOffset } : undefined}>
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
      <FilePicker
        accept=".json,application/json"
        inputRef={jsonReplaceRef}
        onFile={onImportJSONReplace}
      />
      <FilePicker
        accept=".json,application/json"
        inputRef={jsonMergeRef}
        onFile={onImportJSONMerge}
      />
      <FilePicker
        accept=".svg,image/svg+xml"
        inputRef={svgReplaceRef}
        onFile={onImportSVGReplace}
      />
      <FilePicker
        accept=".svg,image/svg+xml"
        inputRef={svgMergeRef}
        onFile={onImportSVGMerge}
      />
      {hint && <ModeHint text={hint} />}
      <TopBar modeLabel={adapter.label} />

      {adapter?.id === 'education' ? (
        <EducationToolbar
          emit={emit}
          cursor={cursor}
          events={events}
          selectedId={
            selectedIds && selectedIds.size === 1
              ? Array.from(selectedIds)[0]
              : null
          }
          readOnly={educationReadOnly}
        />
      ) : adapter?.id === 'review' ? (
        <ReviewToolbar
          submission={reviewSubmission}
          onDecision={onReviewDecision}
          reviewerId={reviewerId}
          cursor={cursor}
        />
      ) : readOnly ? null : (
        <Toolbar
          mode={adapter}
          onOpenTemplateGenerator={onOpenTemplateGenerator}
          emit={emit}
          getState={getState}
          events={events}
          cursor={cursor}
          documentName={documentName}
          onSave={onSave}
          onSaveAs={onSaveAs}
          recentDocs={recentDocs}
          onOpenDocument={onOpenDocument}
          canPersist={canPersist}
          onImportJSONReplace={openImportJSONReplace}
          onImportJSONMerge={openImportJSONMerge}
          onImportSVGReplace={openImportSVGReplace}
          onImportSVGMerge={openImportSVGMerge}
          canImport={canImport}
        />
      )}

      {adapter?.id === 'education' || adapter?.id === 'review' || readOnly ? null : (
        <PropertyBar events={events} cursor={cursor} emit={emit} />
      )}

      <div className="workspace-main">
        <LeftPanel panels={adapter.panels?.left} submission={reviewSubmission} />

        <CanvasStage
          adapter={adapter}
          events={events}
          cursor={cursor}
          emit={emit}
          educationReadOnly={educationReadOnly}
          readOnly={readOnly}
          documentId={documentId}
          canEmitCursor={canEmitCursor}
          presence={presence}
          selfUserId={selfUserId}
          intents={intents}
          onImportJSONReplace={openImportJSONReplace}
          onImportJSONMerge={openImportJSONMerge}
          onImportSVGReplace={openImportSVGReplace}
          onImportSVGMerge={openImportSVGMerge}
          canImport={canImport}
        />

        <RightPanel
          panels={rightPanels}
          events={events}
          cursor={cursor}
          emit={emit}
          capabilities={adapter?.capabilities}
          rubric={reviewRubric}
          reviewCriteria={reviewSubmission?.review?.criteria}
          onReviewCriteriaChange={onReviewCriteriaChange}
          submissionId={reviewSubmission?.id}
          setCursorIndex={setCursorIndex}
          documentId={documentId}
        />
      </div>

      <TimelineBar
        events={events}
        cursor={cursor}
        setCursorIndex={setCursorIndex}
        onUndo={readOnly ? undefined : undo}
        onRedo={readOnly ? undefined : redo}
        submissionId={reviewSubmission?.id}
      />
      <ExportGateOverlay />
    </div>
  );
}

export function WorkspaceLayout({
  adapter,
  events,
  cursor,
  setCursorIndex,
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
  intents,
}) {
  return (
    <SelectionProvider>
      <ModeProvider value={adapter?.id || 'graphic'}>
        <WorkspaceLayoutInner
          adapter={adapter}
          events={events}
          cursor={cursor}
          setCursorIndex={setCursorIndex}
          emit={emit}
          documentName={documentName}
          onSave={onSave}
          onSaveAs={onSaveAs}
          recentDocs={recentDocs}
          onOpenDocument={onOpenDocument}
          canPersist={canPersist}
          onImportJSONReplace={onImportJSONReplace}
          onImportJSONMerge={onImportJSONMerge}
          onImportSVGReplace={onImportSVGReplace}
          onImportSVGMerge={onImportSVGMerge}
          canImport={canImport}
          onOpenTemplateGenerator={onOpenTemplateGenerator}
          educationReadOnly={educationReadOnly}
          readOnly={readOnly}
          documentRole={documentRole}
          documentId={documentId}
          reviewSubmission={reviewSubmission}
          reviewRubric={reviewRubric}
          onReviewDecision={onReviewDecision}
          onReviewCriteriaChange={onReviewCriteriaChange}
          reviewerId={reviewerId}
          presence={presence}
          intents={intents}
        />
      </ModeProvider>
    </SelectionProvider>
  );
}
