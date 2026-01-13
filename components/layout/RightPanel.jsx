'use client';

import { useSelection } from '@/components/workspace/SelectionContext';
import { useReplayState } from '@/runtime/replay/useReplayState';
import LayoutInspector from '@/components/inspector/LayoutInspector';
import { AutoLayoutPanel } from '@/components/inspector/AutoLayoutPanel';
import { Panel } from '@/ui/Panel';
import { EducationInspector } from '@/education/EducationInspector';
import { EducationTimelinePanel } from '@/education/EducationTimelinePanel';
import { getEducationAtCursor } from '@/education/selectEducationState';
import RubricPanel from '@/review/panels/RubricPanel';
import AnnotationPanel from '@/review/panels/AnnotationPanel';
import CurveEditorPanel from '@/ui/animation/curves/CurveEditorPanel';

export default function RightPanel({
  panels = [],
  events,
  cursor,
  emit,
  capabilities,
  rubric,
  reviewCriteria,
  onReviewCriteriaChange,
  submissionId,
  setCursorIndex,
}) {
  const { selectedIds } = useSelection();
  const state = useReplayState({ events, cursor });
  const educationState = getEducationAtCursor(state, cursor);

  const selectedId =
    selectedIds && selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;
  const node = selectedId ? state.nodes?.[selectedId] : null;

  return (
    <aside className="right-panel">
      {panels?.includes('InspectorPanel') && (
        <Panel title="Inspector">
          <LayoutInspector node={node} emit={emit} />
        </Panel>
      )}
      {panels?.includes('AutoLayoutPanel') && node ? (
        <Panel title="Auto Layout">
          <AutoLayoutPanel node={node} emit={emit} />
        </Panel>
      ) : null}
      {panels?.includes('EducationInspector') ? (
        <Panel title="Education Inspector">
          <EducationInspector />
        </Panel>
      ) : null}
      {panels?.includes('EducationTimelinePanel') ? (
        <Panel title="Education Timeline">
          <EducationTimelinePanel explanations={educationState.explanations} />
        </Panel>
      ) : null}
      {panels?.includes('RubricPanel') ? (
        <Panel title="Rubric">
          <RubricPanel
            rubric={rubric}
            initialScores={reviewCriteria}
            onUpdate={onReviewCriteriaChange}
          />
        </Panel>
      ) : null}
      {panels?.includes('AnnotationPanel') ? (
        <Panel title="Annotations">
          <AnnotationPanel
            submissionId={submissionId}
            setCursorIndex={setCursorIndex}
          />
        </Panel>
      ) : null}
      {capabilities?.animation ? (
        <Panel title="Easing Curve">
          <CurveEditorPanel capabilities={capabilities} />
        </Panel>
      ) : null}
    </aside>
  );
}
