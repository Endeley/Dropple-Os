'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceLayout } from '../shared/WorkspaceLayout.jsx';
import { GridProvider } from '../shared/GridContext.jsx';
import { ClipboardProvider } from '../shared/ClipboardContext.jsx';
import { applyAutoLayoutIfNeeded } from '../shared/useAutoLayoutCommit.js';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { EducationCursorProvider } from '@/education/EducationCursorContext';
import TemplateGeneratorOverlay from '@/templates/TemplateGeneratorOverlay';
import { useTemplateGenerator } from '@/templates/useTemplateGenerator';
import { canvasBus } from '../../eventBus/canvasBus.js';
import { loadRegistry } from '@/infrastructure/persistence/documentRegistry.js';
import { useDocumentRole } from '@/collab/useDocumentRole';
import { usePresence } from '@/collab/usePresence';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { useIntentPreview } from '@/collab/useIntentPreview';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { PersistenceBridge } from '@/ui/bridges/PersistenceBridge.jsx';
import { SessionGroupingBridge } from '@/ui/interactions/sessionGrouping.js';
import { getWorkspaceAdapter, resolveWorkspaceId } from '@/ui/bridges/workspaceActivationFacade.js';
import { resolveWorkspaceContext } from '@/platform/workspaces/resolveWorkspaceContext.js';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { WorkspaceSwitcher } from '@/ui/workspace/shared/WorkspaceSwitcher.jsx';
import { ModeSwitcher } from '@/ui/workspace/shared/ModeSwitcher.jsx';
import { useWorkspaceNavigation } from '@/ui/workspace/shared/useWorkspaceNavigation.js';

const PANEL_LEFT = new Set(['SubmissionInfoPanel', 'LessonOutlinePanel']);
const PANEL_RIGHT = new Set([
    'InspectorPanel',
    'AutoLayoutPanel',
    'EducationInspector',
    'EducationTimelinePanel',
    'RubricPanel',
    'AnnotationPanel',
    'SharingPanel',
]);
const PANEL_TOP = new Set(['EducationToolbar', 'ReviewToolbar']);
const PANEL_BOTTOM = new Set(['TimelineBar']);

function mapPanels(panels = []) {
    const layout = {
        left: [],
        right: [],
        top: [],
        bottom: [],
    };

    panels.forEach((panel) => {
        if (PANEL_LEFT.has(panel)) {
            layout.left.push(panel);
            return;
        }
        if (PANEL_TOP.has(panel)) {
            layout.top.push(panel);
            return;
        }
        if (PANEL_BOTTOM.has(panel)) {
            layout.bottom.push(panel);
            return;
        }
        if (PANEL_RIGHT.has(panel)) {
            layout.right.push(panel);
            return;
        }
        layout.right.push(panel);
    });

    return layout;
}

function resolveWorkspaceAdapter(modeId) {
    const adapter = getWorkspaceAdapter(modeId);
    return {
        ...adapter,
        panels: mapPanels(adapter?.panels || []),
    };
}

export function EditorWorkspaceShell({
    modeId,
    workspaceContext: providedWorkspaceContext = null,
    showWorkspaceNavigation = true,
    educationRole = 'teacher',
    educationInitialLocked = true,
    educationReadOnly = false,
    initialEvents = [],
    initialCursorIndex = -1,
    disableSeed = false,
    initialDocumentId = null,
    skipDraftRestore = false,
    readOnly = false,
    reviewSubmission,
    reviewRubric,
    onReviewDecision,
    onReviewCriteriaChange,
    reviewerId,
}) {
    const adapter = resolveWorkspaceAdapter(modeId);
    const workspaceContext = useMemo(
        () => providedWorkspaceContext ?? resolveWorkspaceContext({ workspace: modeId }),
        [modeId, providedWorkspaceContext],
    );
    const dispatcher = useDispatcher();
    const { goToMode, goToWorkspace } = useWorkspaceNavigation();
    const { capabilities } = useWorkspaceCapabilities({
        workspace: workspaceContext.workspace,
        mode: workspaceContext.mode,
    });
    const templateGen = useTemplateGenerator();

    const events = useRuntimeStore((s) => s.events);
    const cursorIndex = useRuntimeStore((s) => s.cursorIndex);
    const setCursorIndex = useRuntimeStore((s) => s.setCursorIndex);
    const [hydrated, setHydrated] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');
    const [recentDocs, setRecentDocs] = useState(() => loadRegistry());
    const skipAutoLayoutOnce = useRef(initialEvents.length > 0);
    const emit = useCallback((event) => canvasBus.emit(event), []);

    const documentRole = useDocumentRole(documentId);
    const effectiveReadOnly = readOnly || documentRole === 'viewer';

    const canEmitPresence = documentRole === 'owner' || documentRole === 'editor';
    const presence = usePresence({
        docId: documentId,
        enabled: canEmitPresence,
    });

    const galleryIdentity = useGalleryIdentity();
    const selfUserId = galleryIdentity?.id ?? null;
    const canEmitIntent = documentRole === 'owner' || documentRole === 'editor';
    const intents = useIntentPreview({
        docId: documentId,
        enabled: canEmitIntent,
        selfUserId,
    });

    const persistenceEnabled =
        !effectiveReadOnly &&
        adapter?.ui?.editing !== false &&
        adapter?.id !== 'review' &&
        !(adapter?.id === 'education' && educationReadOnly);

    const importEnabled =
        !effectiveReadOnly &&
        adapter?.ui?.editing !== false &&
        adapter?.id !== 'review' &&
        !(adapter?.id === 'education' && educationReadOnly);

    useCapabilityLifecycle({
        capabilities,
        dispatcher,
        workspace: workspaceContext.workspace,
        mode: workspaceContext.mode,
    });

    /* ---------------- layout & seed ---------------- */

    useEffect(() => {
        if (!hydrated || events.length === 0) return;
        if (skipAutoLayoutOnce.current) {
            skipAutoLayoutOnce.current = false;
            return;
        }

        const last = events[events.length - 1];
        if (!new Set(['node.layout.setAutoLayout', 'node.layout.clearAutoLayout', 'node.layout.resize', 'node.create', 'node.delete', 'node.children.reorder']).has(last.type)) return;

        applyAutoLayoutIfNeeded({
            state: getDesignStateAtCursor({
                events,
                uptoIndex: events.length - 1,
            }),
            emit,
        });
    }, [events, emit, hydrated]);

    /* ---------------- render ---------------- */

    const cursor = { index: cursorIndex };

    const replayState = useMemo(
        () =>
            getDesignStateAtCursor({
                events,
                uptoIndex: cursorIndex,
            }),
        [events, cursorIndex],
    );

    const workspace = (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {showWorkspaceNavigation && (
                <div
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1200,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8,
                    }}>
                    <div
                        style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            border: '1px solid rgba(148, 163, 184, 0.35)',
                            background: 'rgba(15, 23, 42, 0.84)',
                            color: '#e2e8f0',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            backdropFilter: 'blur(10px)',
                        }}>
                        {`${workspaceContext.label} ${workspaceContext.modeLabel ? `· ${workspaceContext.modeLabel}` : ''}`}
                    </div>
                    <WorkspaceSwitcher
                        activeWorkspace={workspaceContext.workspace}
                        onChange={goToWorkspace}
                    />
                    <ModeSwitcher
                        workspace={workspaceContext.workspace}
                        activeMode={workspaceContext.mode}
                        onChange={(nextMode) => goToMode(workspaceContext.workspace, nextMode)}
                    />
                </div>
            )}
            <WorkspaceLayout
                adapter={adapter}
                events={events}
                cursor={cursor}
                setCursorIndex={setCursorIndex}
                emit={emit}
                documentName={documentName}
                canPersist={persistenceEnabled}
                canImport={importEnabled}
                onOpenTemplateGenerator={templateGen.openGenerator}
                educationReadOnly={educationReadOnly}
                readOnly={effectiveReadOnly}
                documentRole={documentRole}
                documentId={documentId}
                intents={intents}
                reviewSubmission={reviewSubmission}
                reviewRubric={reviewRubric}
                onReviewDecision={onReviewDecision}
                onReviewCriteriaChange={onReviewCriteriaChange}
                reviewerId={reviewerId}
                presence={presence}
            />
        </div>
    );

    return (
        <>
            <PersistenceBridge
                enabled={persistenceEnabled}
                initialDocumentId={initialDocumentId}
                initialEvents={initialEvents}
                initialCursorIndex={initialCursorIndex}
                documentId={documentId}
                documentName={documentName}
                onDocumentIdChange={setDocumentId}
                onDocumentNameChange={setDocumentName}
                onRecentDocsChange={setRecentDocs}
                onHydratedChange={setHydrated}
                workspace={workspaceContext.workspace}
                mode={workspaceContext.mode}
            />
            <SessionGroupingBridge />
            <GridProvider>
                <ClipboardProvider>
                    {modeId === 'education' ? (
                        <EducationCursorProvider role={educationRole} initialLocked={educationInitialLocked}>
                            {workspace}
                        </EducationCursorProvider>
                    ) : (
                        workspace
                    )}
                    <TemplateGeneratorOverlay open={templateGen.open} onClose={templateGen.closeGenerator} state={replayState} events={events} mode={adapter} />
                </ClipboardProvider>
            </GridProvider>
        </>
    );
}
