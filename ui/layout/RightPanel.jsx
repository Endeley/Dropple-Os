'use client';

import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { useReplayState } from '@/runtime/replay/useReplayState';

import LayoutInspector from '@/ui/inspector/LayoutInspector';
import { AppearancePanel } from '@/ui/inspector/AppearancePanel';
import { AutoLayoutPanel } from '@/ui/inspector/AutoLayoutPanel';
import { Panel } from '@/ui/Panel';

import { EducationInspector } from '@/education/EducationInspector';
import { EducationTimelinePanel } from '@/education/EducationTimelinePanel';
import { getEducationAtCursor } from '@/education/selectEducationState';

import RubricPanel from '@/review/panels/RubricPanel';
import AnnotationPanel from '@/review/panels/AnnotationPanel';

import CurveEditorPanel from '@/ui/animation/curves/CurveEditorPanel';
import SharingPanel from '@/collaboration/panels/SharingPanel';

import { getNode } from '@/runtime/document/documentAdapter.js';
import { useWorkspaceProjectionState as useRuntimeStore } from '@/runtime/projection';

export default function RightPanel({ panels = [], events, cursor, emit, capabilities, rubric, reviewCriteria, onReviewCriteriaChange, submissionId, documentId, readOnly = false }) {
    const { selectedIds } = useSelection();

    const state = useReplayState({ events, cursor });
    const educationState = getEducationAtCursor(state, cursor);

    const selectedId = selectedIds && selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;

    const node = selectedId ? getNode(state, selectedId) : null;

    const resizeDebug = useRuntimeStore((s) => s.resizeDebug ?? '');

    // ----- CAPABILITY FLAGS -----

    const hasSelection = !!node;
    const hasMultiSelection = selectedIds && selectedIds.size > 1;

    const showAutoLayout = panels.includes('AutoLayoutPanel') && hasSelection;
    const showSharing = panels.includes('SharingPanel') && !!documentId;

    const showEducationInspector = panels.includes('EducationInspector');
    const showEducationTimeline = panels.includes('EducationTimelinePanel');

    const showRubric = panels.includes('RubricPanel');
    const showAnnotation = panels.includes('AnnotationPanel') && !!submissionId;

    const showCurveEditor = !!capabilities?.animation;

    // ----- EMPTY STATE -----

    const isEmpty = !hasSelection && !hasMultiSelection && !showEducationInspector && !showRubric;

    return (
        <aside className='right-panel'>
            {/* =========================
               EMPTY STATE
            ========================= */}
            {isEmpty && (
                <div className='inspector-empty'>
                    <div className='inspector-empty-title'>No selection</div>
                    <div className='inspector-empty-sub'>Select a node to edit properties</div>
                </div>
            )}

            {/* =========================
               SELECTION HEADER
            ========================= */}
            {hasSelection && (
                <Panel title='Selection'>
                    <div className='inspector-section'>
                        <div className='inspector-label'>{node.name || node.type || 'Node'}</div>
                        <div className='inspector-meta'>ID: {node.id}</div>
                    </div>
                </Panel>
            )}

            {/* =========================
               LAYOUT
            ========================= */}
            {hasSelection && (
                <Panel title='Layout'>
                    {resizeDebug && <div className='inspector-debug'>{resizeDebug}</div>}

                    <LayoutInspector node={node} emit={emit} readOnly={readOnly} />
                </Panel>
            )}

            {/* =========================
               APPEARANCE
            ========================= */}
            {hasSelection && (
                <Panel title='Appearance'>
                    <AppearancePanel node={node} emit={emit} readOnly={readOnly} />
                </Panel>
            )}

            {/* =========================
               AUTO LAYOUT
            ========================= */}
            {showAutoLayout && (
                <Panel title='Auto Layout'>
                    <AutoLayoutPanel node={node} emit={emit} />
                </Panel>
            )}

            {/* =========================
               MOTION / ANIMATION
            ========================= */}
            {showCurveEditor && (
                <Panel title='Easing Curve'>
                    <CurveEditorPanel capabilities={capabilities} />
                </Panel>
            )}

            {/* =========================
               SHARING
            ========================= */}
            {showSharing && (
                <Panel title='Sharing'>
                    <SharingPanel docId={documentId} />
                </Panel>
            )}

            {/* =========================
               EDUCATION MODE
            ========================= */}
            {showEducationInspector && (
                <Panel title='Education Inspector'>
                    <EducationInspector />
                </Panel>
            )}

            {showEducationTimeline && (
                <Panel title='Education Timeline'>
                    <EducationTimelinePanel explanations={educationState.explanations} />
                </Panel>
            )}

            {/* =========================
               REVIEW MODE
            ========================= */}
            {showRubric && (
                <Panel title='Rubric'>
                    <RubricPanel rubric={rubric} initialScores={reviewCriteria} onUpdate={onReviewCriteriaChange} />
                </Panel>
            )}

            {showAnnotation && (
                <Panel title='Annotations'>
                    <AnnotationPanel submissionId={submissionId} />
                </Panel>
            )}
        </aside>
    );
}
