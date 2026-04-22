'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorWorkspaceLayout } from './EditorWorkspaceLayout.jsx';
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
import { TokenCssBridge } from '@/ui/bridges/tokenCssBridge.js';
import { SessionGroupingBridge } from '@/ui/interactions/sessionGrouping.js';
import { getWorkspaceAdapter } from '@/ui/bridges/workspaceActivationFacade.js';
import { resolveWorkspaceContext } from '@/platform/workspaces/resolveWorkspaceContext.js';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';
import { useWorkspaceNavigation } from '@/ui/workspace/shared/useWorkspaceNavigation.js';

/**
 * Stable event types (no reallocation)
 */
const AUTO_LAYOUT_EVENTS = new Set(['node.layout.setAutoLayout', 'node.layout.clearAutoLayout', 'node.layout.bulk', 'node.layout.rotate', 'node.create', 'node.delete', 'node.children.reorder']);

export function EditorWorkspaceShell({
    modeId,
    workspaceContext: providedWorkspaceContext = null,
    showWorkspaceNavigation = true,
    educationRole = 'teacher',
    educationInitialLocked = true,
    educationReadOnly = false,
    initialEvents = [],
    initialCursorIndex = -1,
    initialDocumentId = null,
    readOnly = false,
    reviewSubmission,
    reviewRubric,
    onReviewDecision,
    onReviewCriteriaChange,
    reviewerId,
}) {
    /**
     * Workspace + mode resolution
     */
    const workspaceContext = useMemo(() => providedWorkspaceContext ?? resolveWorkspaceContext({ workspace: modeId }), [modeId, providedWorkspaceContext]);

    const adapter = useMemo(() => getWorkspaceAdapter(modeId), [modeId]);

    const { goToMode, goToWorkspace } = useWorkspaceNavigation();

    /**
     * Capabilities
     */
    const { capabilities, surfacePanels } = useWorkspaceCapabilities({
        workspace: workspaceContext.workspaceId,
        mode: workspaceContext.modeId,
    });

    /**
     * Stable emit (intent-only)
     */
    const emit = useCallback((type, payload) => {
        canvasBus.emit(type, payload);
    }, []);

    /**
     * Runtime state
     */
    const events = useRuntimeStore((s) => s.events);
    const cursorIndex = useRuntimeStore((s) => s.cursorIndex);

    /**
     * Document state
     */
    const [hydrated, setHydrated] = useState(false);
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');
    const [recentDocs, setRecentDocs] = useState(() => loadRegistry());

    const skipAutoLayoutOnce = useRef(initialEvents.length > 0);

    /**
     * Collaboration
     */
    const documentRole = useDocumentRole(documentId);
    const effectiveReadOnly = readOnly || documentRole === 'viewer';

    const canEmitPresence = documentRole === 'owner' || documentRole === 'editor';

    const presence = usePresence({
        docId: documentId,
        enabled: canEmitPresence,
    });

    const galleryIdentity = useGalleryIdentity();
    const selfUserId = galleryIdentity?.id ?? null;

    const intents = useIntentPreview({
        docId: documentId,
        enabled: canEmitPresence,
        selfUserId,
    });

    /**
     * Persistence flags
     */
    const persistenceEnabled = !effectiveReadOnly && adapter?.ui?.editing !== false && adapter?.id !== 'review' && !(adapter?.id === 'education' && educationReadOnly);

    /**
     * Capability lifecycle
     */
    useCapabilityLifecycle({
        capabilities,
        emit,
        workspace: workspaceContext.workspaceId,
        mode: workspaceContext.modeId,
    });

    /**
     * Auto-layout reaction
     */
    useEffect(() => {
        if (!hydrated || events.length === 0) return;

        if (skipAutoLayoutOnce.current) {
            skipAutoLayoutOnce.current = false;
            return;
        }

        const last = events[events.length - 1];
        if (!AUTO_LAYOUT_EVENTS.has(last.type)) return;

        applyAutoLayoutIfNeeded({
            state: getDesignStateAtCursor({
                events,
                uptoIndex: events.length - 1,
            }),
            emit,
        });
    }, [events, emit, hydrated]);

    /**
     * Cursor + replay state
     */
    const cursor = { index: cursorIndex };

    const replayState = useMemo(
        () =>
            getDesignStateAtCursor({
                events,
                uptoIndex: cursorIndex,
            }),
        [events, cursorIndex],
    );

    /**
     * Workspace UI
     */
    const workspace = (
        <EditorWorkspaceLayout
            adapter={adapter}
            workspaceContext={workspaceContext}
            showWorkspaceNavigation={showWorkspaceNavigation}
            onGoToWorkspace={goToWorkspace}
            onGoToMode={goToMode}
            events={events}
            cursor={cursor}
            emit={emit}
            documentName={documentName}
            canPersist={persistenceEnabled}
            canImport={persistenceEnabled}
            onOpenTemplateGenerator={useTemplateGenerator().openGenerator}
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
            capabilitySurfacePanels={surfacePanels}
        />
    );

    return (
        <>
            <TokenCssBridge />

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
                workspace={workspaceContext.workspaceId}
                mode={workspaceContext.modeId}
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

                    <TemplateGeneratorOverlay open={useTemplateGenerator().open} onClose={useTemplateGenerator().closeGenerator} state={replayState} events={events} mode={adapter} />
                </ClipboardProvider>
            </GridProvider>
        </>
    );
}
