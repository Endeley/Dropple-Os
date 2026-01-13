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
import { useKeyboardShortcuts } from '@/components/interaction/useKeyboardShortcuts';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';

function WorkspaceLayoutInner({
  adapter,
  events,
  cursor,
  setCursorIndex,
  emit,
  onOpenTemplateGenerator,
  educationReadOnly = false,
  reviewSubmission,
  reviewRubric,
  onReviewDecision,
  onReviewCriteriaChange,
  reviewerId,
}) {
  const { selectedIds, setSelection } = useSelection();
  const keyboardEnabled =
    adapter?.interactions?.keyboard !== false &&
    adapter?.capabilities?.editing !== false &&
    adapter?.id !== 'review';

  function getState() {
    return getDesignStateAtCursor({
      events,
      uptoIndex: cursor.index,
    });
  }

  useKeyboardShortcuts({
    enabled: keyboardEnabled,
    selectedIds,
    setSelection,
    emit,
    undo: () => setCursorIndex((i) => Math.max(-1, i - 1)),
    redo: () => setCursorIndex((i) => Math.min(events.length - 1, i + 1)),
    getState,
  });

  return (
    <div className="workspace-root">
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
        <Toolbar mode={adapter} onOpenTemplateGenerator={onOpenTemplateGenerator} />
      )}

      {adapter?.id === 'education' || adapter?.id === 'review' ? null : (
        <PropertyBar events={events} cursor={cursor} />
      )}

      <div className="workspace-main">
        <LeftPanel panels={adapter.panels?.left} submission={reviewSubmission} />

        <CanvasStage
          adapter={adapter}
          events={events}
          cursor={cursor}
          emit={emit}
          educationReadOnly={educationReadOnly}
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
      <WorkspaceLayoutInner
        adapter={adapter}
        events={events}
        cursor={cursor}
        setCursorIndex={setCursorIndex}
        emit={emit}
        onOpenTemplateGenerator={onOpenTemplateGenerator}
        educationReadOnly={educationReadOnly}
        reviewSubmission={reviewSubmission}
        reviewRubric={reviewRubric}
        onReviewDecision={onReviewDecision}
        onReviewCriteriaChange={onReviewCriteriaChange}
        reviewerId={reviewerId}
      />
    </SelectionProvider>
  );
}
