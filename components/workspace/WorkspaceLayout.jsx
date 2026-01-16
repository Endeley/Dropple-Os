'use client';

import TopBar from '@/components/layout/TopBar';
import Toolbar from '@/components/layout/Toolbar';
import PropertyBar from '@/components/layout/PropertyBar';
import LeftPanel from '@/components/layout/LeftPanel';
import RightPanel from '@/components/layout/RightPanel';
import TimelineBar from '@/components/layout/TimelineBar';
import CanvasStage from '@/components/layout/CanvasStage';
import { EducationToolbar } from '@/education/EducationToolbar';
import ReviewToolbar from '@/review/ReviewToolbar';
import { SelectionProvider, useSelection } from './SelectionContext';
import { ModeProvider, useMode } from './ModeContext';
import { useKeyboardShortcuts } from '@/components/interaction/useKeyboardShortcuts';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { registerCreationResolver } from '@/ui/creation/creationResolver';
import { registerCreateShapeTool } from '@/ui/tools/createShapeTool';
import { registerCreateFrameTool } from '@/ui/tools/createFrameTool';
import { registerCreateLayerTool } from '@/ui/tools/createLayerTool';
import { useKeyboardNudge } from '@/ui/keyboard/useKeyboardNudge';
import { useAlignmentShortcuts } from '@/ui/keyboard/useAlignmentShortcuts';
import { useModeOnboarding } from '@/onboarding/useModeOnboarding';
import { ModeHint } from '@/onboarding/ModeHint';
import { FilePicker } from '@/ui/files/FilePicker';
import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
import { buildCommands } from '@/commands/commandRegistry';

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
  reviewSubmission,
  reviewRubric,
  onReviewDecision,
  onReviewCriteriaChange,
  reviewerId,
}) {
  const { selectedIds, setSelection, selectSingle } = useSelection();
  const keyboardEnabled =
    adapter?.interactions?.keyboard !== false &&
    adapter?.capabilities?.editing !== false &&
    adapter?.id !== 'review';
  const hintMode = adapter?.id === 'design' ? 'graphic' : adapter?.id;
  const hint = useModeOnboarding(hintMode);
  const mode = useMode();

  const { open: commandOpen, close: commandClose } = useCommandPalette({
    enabled: keyboardEnabled,
  });

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

  function getState() {
    return getDesignStateAtCursor({
      events,
      uptoIndex: cursor.index,
    });
  }

  const replayState = useMemo(() => getState(), [events, cursor.index]);
  const selected =
    selectedIds && selectedIds.size > 1
      ? Array.from(selectedIds).map((id) => replayState.nodes?.[id]).filter(Boolean)
      : [];

  const commands = useMemo(
    () =>
      buildCommands({
        emit,
        nodes: replayState.nodes || {},
        events,
        cursorIndex: cursor.index,
        selected,
        mode: hintMode || mode,
      }),
    [emit, events, cursor.index, replayState.nodes, selected, hintMode, mode]
  );

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

  useEffect(() => {
    const unregisterResolver = registerCreationResolver({
      getMode: () => adapter?.id,
    });
    const unregisterShape = registerCreateShapeTool({ emit, selectSingle });
    const unregisterFrame = registerCreateFrameTool({ emit, selectSingle });
    const unregisterLayer = registerCreateLayerTool({ emit, selectSingle });

    return () => {
      unregisterResolver?.();
      unregisterShape?.();
      unregisterFrame?.();
      unregisterLayer?.();
    };
  }, [adapter?.id, emit, selectSingle]);

  return (
    <div className="workspace-root">
      {commandOpen && (
        <CommandPalette
          commands={commands}
          context={{ selected, mode: hintMode || mode, readOnly: false }}
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
      ) : (
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

      {adapter?.id === 'education' || adapter?.id === 'review' ? null : (
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
          onImportJSONReplace={openImportJSONReplace}
          onImportJSONMerge={openImportJSONMerge}
          onImportSVGReplace={openImportSVGReplace}
          onImportSVGMerge={openImportSVGMerge}
          canImport={canImport}
        />

        <RightPanel
          panels={adapter.panels?.right}
          events={events}
          cursor={cursor}
          emit={emit}
          capabilities={adapter?.capabilities}
          rubric={reviewRubric}
          reviewCriteria={reviewSubmission?.review?.criteria}
          onReviewCriteriaChange={onReviewCriteriaChange}
          submissionId={reviewSubmission?.id}
          setCursorIndex={setCursorIndex}
        />
      </div>

      <TimelineBar
        events={events}
        cursor={cursor}
        setCursorIndex={setCursorIndex}
        onUndo={undo}
        onRedo={redo}
        submissionId={reviewSubmission?.id}
      />
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
  reviewSubmission,
  reviewRubric,
  onReviewDecision,
  onReviewCriteriaChange,
  reviewerId,
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
          reviewSubmission={reviewSubmission}
          reviewRubric={reviewRubric}
          onReviewDecision={onReviewDecision}
          onReviewCriteriaChange={onReviewCriteriaChange}
          reviewerId={reviewerId}
        />
      </ModeProvider>
    </SelectionProvider>
  );
}
