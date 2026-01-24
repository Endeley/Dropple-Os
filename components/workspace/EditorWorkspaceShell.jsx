'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModeRegistry } from '@/workspaces/modes/ModeRegistry';
import { WorkspaceLayout } from './WorkspaceLayout';
import { MessageBus } from '@/runtime/MessageBus';
import { GridProvider } from './GridContext';
import { ClipboardProvider } from './ClipboardContext';
import { applyAutoLayoutIfNeeded } from './useAutoLayoutCommit';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';
import { EducationCursorProvider } from '@/education/EducationCursorContext';
import TemplateGeneratorOverlay from '@/templates/TemplateGeneratorOverlay';
import { useTemplateGenerator } from '@/templates/useTemplateGenerator';
import { createLocalDocumentSnapshot, hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { loadLocalDocument, saveLocalDocument } from '@/persistence/localDocumentStore';
import { canvasBus } from '@/ui/canvasBus';
import { getActiveDocument, setActiveDocument } from '@/persistence/activeDocument';
import { loadRegistry } from '@/persistence/documentRegistry';
import { loadDocumentSnapshot, saveDocumentSnapshot } from '@/persistence/documentCommands';
import { readJSONFile } from '@/import/importJSON';
import { parseSVG } from '@/import/svg/parseSVG';
import { useDocumentRole } from '@/collab/useDocumentRole';
import { usePresence } from '@/collab/usePresence';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { useIntentPreview } from '@/collab/useIntentPreview';

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
    const adapter = ModeRegistry.get(modeId);
    const templateGen = useTemplateGenerator();

    const [events, setEvents] = useState(() => initialEvents);
    const [cursorIndex, setCursorIndex] = useState(initialCursorIndex);
    const [hydrated, setHydrated] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');
    const [recentDocs, setRecentDocs] = useState(() => loadRegistry());
    const skipAutoLayoutOnce = useRef(initialEvents.length > 0);
    const bus = useMemo(() => new MessageBus({ runId: 'design-run' }), []);
    const emit = useCallback((event) => bus.emit(event), [bus]);
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

    const persistenceEnabled = !effectiveReadOnly && adapter?.id !== 'review' && !(adapter?.id === 'education' && educationReadOnly);

    const importEnabled = !effectiveReadOnly && adapter?.capabilities?.editing !== false && adapter?.id !== 'review' && !(adapter?.id === 'education' && educationReadOnly);

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
        return bus.subscribe((event) => {
            setEvents((prev) => {
                const groupId = editGroupRef.current.id;
                const nextEvent = groupId ? { ...event, groupId } : event;
                const next = [...prev, nextEvent];
                setCursorIndex(next.length - 1);
                return next;
            });
        });
    }, [bus]);

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
