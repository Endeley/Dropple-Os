'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorWorkspaceLayout } from './EditorWorkspaceLayout.jsx';
import { GridProvider } from '../shared/GridContext.jsx';
import { ClipboardProvider } from '../shared/ClipboardContext.jsx';
import { applyAutoLayoutIfNeeded } from '../shared/useAutoLayoutCommit.js';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { EducationCursorProvider } from '@/education/EducationCursorContext';
import { canvasBus } from '../../eventBus/canvasBus.js';
import { loadRegistry } from '@/infrastructure/persistence/documentRegistry.js';
import { useDocumentRole } from '@/collab/useDocumentRole';
import { usePresence } from '@/collab/usePresence';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { useIntentPreview } from '@/collab/useIntentPreview';
import { useWorkspaceProjectionState as useRuntimeStore } from '@/runtime/projection';
import { PersistenceBridge } from '@/ui/bridges/PersistenceBridge.jsx';
import { TokenCssBridge } from '@/ui/bridges/tokenCssBridge.js';
import { SessionGroupingBridge } from '@/ui/interactions/sessionGrouping.js';
import { getWorkspaceAdapter } from '@/ui/bridges/workspaceActivationFacade.js';
import { resolveWorkspaceContext } from '@/platform/workspaces/resolveWorkspaceContext.js';
import { resolveCanonicalWorkspaceOverlayContext } from '@/platform/workspaces/modeResolution.js';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';
import { useWorkspaceNavigation } from '@/ui/workspace/shared/useWorkspaceNavigation.js';
import { openTemplatePublishDialog } from '@/ui/bridges/templatePublishRuntimeFacade.js';
import {
    createArtifactPersistenceSnapshot,
    createEnvironmentArtifact,
    createSnapshotArtifact,
} from '@/runtime/export/exportArtifact.js';

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
    initialEnvironmentDescriptor = null,
    initialResolvedTemplateEnvironment = null,
    initialRuntimeSnapshot = null,
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
    const overlayContext = useMemo(
        () =>
            resolveCanonicalWorkspaceOverlayContext({
                workspace: workspaceContext.workspaceId,
                mode: modeId ?? workspaceContext.modeId,
            }),
        [modeId, workspaceContext.modeId, workspaceContext.workspaceId],
    );
    const isLearningOverlay = overlayContext.overlayId === 'learning';

    const adapter = useMemo(
        () => getWorkspaceAdapter(providedWorkspaceContext ?? { workspaceId: workspaceContext.workspaceId, modeId: workspaceContext.modeId }),
        [providedWorkspaceContext, workspaceContext.modeId, workspaceContext.workspaceId],
    );

    const { goToMode, goToWorkspace } = useWorkspaceNavigation();

    /**
     * Capabilities
     */
    const { capabilities, surfacePanels } = useWorkspaceCapabilities({
        workspace: workspaceContext.workspaceId,
        mode: overlayContext.canonicalModeId ?? workspaceContext.modeId,
        overlayId: overlayContext.overlayId,
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
    const persistenceEnabled =
        !effectiveReadOnly &&
        adapter?.ui?.editing !== false &&
        adapter?.id !== 'review' &&
        !(isLearningOverlay && educationReadOnly);

    /**
     * Capability lifecycle
     */
    useCapabilityLifecycle({
        capabilities,
        emit,
        workspace: workspaceContext.workspaceId,
        mode: overlayContext.canonicalModeId ?? workspaceContext.modeId,
        overlayId: overlayContext.overlayId,
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
     * Cursor state
     */
    const cursor = { index: cursorIndex };
    const hasPublicationDescriptor = initialEnvironmentDescriptor != null;
    const hasResolvedPublicationEnvironment = initialResolvedTemplateEnvironment != null;

    if (hasPublicationDescriptor !== hasResolvedPublicationEnvironment) {
        throw new Error(
            'Invalid publication state: descriptor and resolvedEnvironment must both exist or both be absent.',
        );
    }

    const exportArtifact = useMemo(
        () => {
            if (hasPublicationDescriptor) {
                return createEnvironmentArtifact({
                    descriptor: initialEnvironmentDescriptor,
                    resolvedEnvironment: initialResolvedTemplateEnvironment,
                });
            }

            return createSnapshotArtifact({
                snapshot: createArtifactPersistenceSnapshot({
                    events,
                    cursorIndex,
                    metadata: {
                        mode: overlayContext.canonicalModeId ?? workspaceContext.modeId,
                    },
                }),
            });
        },
        [
            cursorIndex,
            events,
            hasPublicationDescriptor,
            initialEnvironmentDescriptor,
            initialResolvedTemplateEnvironment,
            overlayContext.canonicalModeId,
            workspaceContext.modeId,
        ],
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
            exportArtifact={exportArtifact}
            documentName={documentName}
            canPersist={persistenceEnabled}
            canImport={persistenceEnabled}
            publicationDescriptor={initialEnvironmentDescriptor}
            publicationResolvedTemplateEnvironment={initialResolvedTemplateEnvironment}
            onOpenTemplateGenerator={() =>
                openTemplatePublishDialog({
                    mode: {
                        id: workspaceContext.modeId,
                        workspaceId: workspaceContext.workspaceId,
                    },
                })
            }
            educationReadOnly={educationReadOnly}
            isLearningOverlay={isLearningOverlay}
            toolModeId={overlayContext.canonicalModeId ?? workspaceContext.modeId}
            overlayId={overlayContext.overlayId}
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
                initialEnvironmentDescriptor={initialEnvironmentDescriptor}
                initialResolvedTemplateEnvironment={initialResolvedTemplateEnvironment}
                initialRuntimeSnapshot={initialRuntimeSnapshot}
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
                    {isLearningOverlay ? (
                        <EducationCursorProvider role={educationRole} initialLocked={educationInitialLocked}>
                            {workspace}
                        </EducationCursorProvider>
                    ) : (
                        workspace
                    )}
                </ClipboardProvider>
            </GridProvider>
        </>
    );
}
