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

  const showInspector = panels.includes('InspectorPanel') && !!node;
  const showAutoLayout = panels.includes('AutoLayoutPanel') && !!node;
  const showEducationInspector = panels.includes('EducationInspector');
  const showEducationTimeline = panels.includes('EducationTimelinePanel');
  const showRubric = panels.includes('RubricPanel');
  const showAnnotation = panels.includes('AnnotationPanel') && !!submissionId;
  const showCurveEditor = !!capabilities?.animation;

  const isRelevant =
    showInspector ||
    showAutoLayout ||
    showEducationInspector ||
    showEducationTimeline ||
    showRubric ||
    showAnnotation ||
    showCurveEditor;

  return (
    <aside
      className="right-panel"
      aria-hidden={!isRelevant}
      style={{
        transition: 'opacity 120ms ease, transform 120ms ease',
        opacity: isRelevant ? 1 : 0,
        transform: isRelevant ? 'translateX(0)' : 'translateX(8px)',
        pointerEvents: isRelevant ? 'auto' : 'none',
      }}
    >
      {showInspector && (
        <Panel title="Inspector">
          <LayoutInspector node={node} emit={emit} />
        </Panel>
      )}

      {showAutoLayout && (
        <Panel title="Auto Layout">
          <AutoLayoutPanel node={node} emit={emit} />
        </Panel>
      )}

      {showEducationInspector && (
        <Panel title="Education Inspector">
          <EducationInspector />
        </Panel>
      )}

      {showEducationTimeline && (
        <Panel title="Education Timeline">
          <EducationTimelinePanel explanations={educationState.explanations} />
        </Panel>
      )}

      {showRubric && (
        <Panel title="Rubric">
          <RubricPanel
            rubric={rubric}
            initialScores={reviewCriteria}
            onUpdate={onReviewCriteriaChange}
          />
        </Panel>
      )}

      {showAnnotation && (
        <Panel title="Annotations">
          <AnnotationPanel
            submissionId={submissionId}
            setCursorIndex={setCursorIndex}
          />
        </Panel>
      )}

      {showCurveEditor && (
        <Panel title="Easing Curve">
          <CurveEditorPanel capabilities={capabilities} />
        </Panel>
      )}
    </aside>
  );
}
