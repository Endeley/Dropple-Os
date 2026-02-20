'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WorkspaceRegistry } from '@/workspaces/registry';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy';
import { WorkspaceLayout } from './WorkspaceLayout';
import { GridProvider } from './GridContext';
import { ClipboardProvider } from './ClipboardContext';
import { applyAutoLayoutIfNeeded } from './useAutoLayoutCommit';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';
import { EducationCursorProvider } from '@/education/EducationCursorContext';
import TemplateGeneratorOverlay from '@/templates/TemplateGeneratorOverlay';
import { useTemplateGenerator } from '@/templates/useTemplateGenerator';
import { createLocalDocumentSnapshot, hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { loadLocalDocument, saveLocalDocument } from '@/persistence/localDocumentStore';
import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { getActiveDocument, setActiveDocument } from '@/persistence/activeDocument';
import { loadRegistry } from '@/persistence/documentRegistry';
import { loadDocumentSnapshot, saveDocumentSnapshot } from '@/persistence/documentCommands';
import { readJSONFile } from '@/import/importJSON';
import { parseSVG } from '@/import/svg/parseSVG';
import { useDocumentRole } from '@/collab/useDocumentRole';
import { usePresence } from '@/collab/usePresence';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { useIntentPreview } from '@/collab/useIntentPreview';

const MODE_ALIASES = {
    design: 'graphic',
};

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

function resolveWorkspaceId(modeId) {
    if (!modeId) return 'graphic';
    const key = String(modeId);
    if (WorkspaceRegistry[key]) return key;
    if (MODE_ALIASES[key]) return MODE_ALIASES[key];
    return 'graphic';
}

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
    const workspaceId = resolveWorkspaceId(modeId);
    const policy = resolveWorkspacePolicy(workspaceId);

    const workspace = WorkspaceRegistry[workspaceId];
    if (!workspace || policy?.error) {
        return {
            id: modeId || workspaceId,
            label: modeId || workspaceId,
            workspaceId,
            capabilities: {},
            panels: mapPanels([]),
            interactions: { keyboard: true, pointer: true },
            ui: { editing: true },
        };
    }

    const isEducation = modeId === 'education';
    const isReview = modeId === 'review';
    const editingEnabled = policy?.capabilities?.editing !== false;

    return {
        id: modeId || workspaceId,
        label: workspace.label || modeId || workspaceId,
        workspaceId,
        profile: workspace.profile,
        capabilities: policy.capabilities || {},
        timeline: policy.timeline || null,
        allowedEventTypes: policy.allowedEventTypes || null,
        panels: mapPanels(workspace.panels || []),
        interactions: {
            keyboard: !isEducation && !isReview,
            pointer: !isEducation && !isReview,
        },
        ui: {
            editing: editingEnabled && !isEducation && !isReview,
        },
    };
}

export function EditorWorkspaceShell({
    modeId,
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
    const templateGen = useTemplateGenerator();

    const [events, setEvents] = useState(() => initialEvents);
    const [cursorIndex, setCursorIndex] = useState(initialCursorIndex);
    const [hydrated, setHydrated] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');
    const [recentDocs, setRecentDocs] = useState(() => loadRegistry());
    const skipAutoLayoutOnce = useRef(initialEvents.length > 0);
    const emit = useCallback((event) => canvasBus.emit(event), []);
    const saveTimerRef = useRef(null);
    const editGroupRef = useRef({ id: null });

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

    /* ---------------- canvas grouping ---------------- */

    useEffect(() => {
        function beginGroup() {
            if (!editGroupRef.current.id) {
                editGroupRef.current.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `group-${Math.random().toString(36).slice(2, 10)}`;
            }
        }

        function endGroup() {
            editGroupRef.current.id = null;
        }

        canvasBus.on('session.start', beginGroup);
        canvasBus.on('intent.edit.begin', beginGroup);
        canvasBus.on('intent.edit.commit', endGroup);
        canvasBus.on('session.commit', endGroup);
        canvasBus.on('session.cancel', endGroup);

        return () => {
            canvasBus.off('session.start', beginGroup);
            canvasBus.off('intent.edit.begin', beginGroup);
            canvasBus.off('intent.edit.commit', endGroup);
            canvasBus.off('session.commit', endGroup);
            canvasBus.off('session.cancel', endGroup);
        };
    }, []);

    /* ---------------- event subscription ---------------- */

    useEffect(() => {
        return canvasBus.subscribe((event) => {
            setEvents((prev) => {
                const groupId = editGroupRef.current.id;
                const nextEvent = groupId ? { ...event, groupId } : event;
                const next = [...prev, nextEvent];
                setCursorIndex(next.length - 1);
                return next;
            });
        });
    }, []);

    /* ---------------- snapshot / persistence ---------------- */

    const applySnapshot = useCallback((snapshot) => {
        setEvents(snapshot.events || []);
        const maxIndex = (snapshot.events || []).length - 1;
        setCursorIndex(Math.max(-1, Math.min(maxIndex, snapshot.cursorIndex ?? -1)));
        if ((snapshot.events || []).length > 0) {
            skipAutoLayoutOnce.current = true;
        }
    }, []);

    useEffect(() => {
        if (!persistenceEnabled) {
            return;
        }

        const activeId = initialDocumentId || getActiveDocument();
        if (activeId) {
            const loaded = loadDocumentSnapshot(activeId);
            if (loaded?.snapshot) {
                setTimeout(() => {
                    applySnapshot(loaded.snapshot);
                    setDocumentId(activeId);
                    setDocumentName(loaded.name || 'Untitled');
                    setActiveDocument(activeId);
                    setTimeout(() => setHydrated(true), 0);
                }, 0);
                return;
            }
        }

        const hydratedSnapshot = hydrateLocalDocumentSnapshot(loadLocalDocument());
        if (hydratedSnapshot) {
            setTimeout(() => {
                applySnapshot(hydratedSnapshot);
            }, 0);
        }

        setTimeout(() => setHydrated(true), 0);
    }, [persistenceEnabled, applySnapshot, initialDocumentId]);

    useEffect(() => {
        if (!persistenceEnabled) {
            setTimeout(() => setHydrated(true), 0);
        }
    }, [persistenceEnabled]);

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
    );

    return (
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
    );
}
