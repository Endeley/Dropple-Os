'use client';

import { useEffect, useRef } from 'react';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import {
    createLocalDocumentSnapshot,
    hydrateLocalDocumentSnapshot,
} from '@/infrastructure/persistence/localDocumentSchema.js';
import { loadLocalDocument, saveLocalDocument } from '@/infrastructure/persistence/localDocumentStore.js';
import { getActiveDocument, setActiveDocument } from '@/infrastructure/persistence/activeDocument.js';
import { loadRegistry } from '@/infrastructure/persistence/documentRegistry.js';
import {
    loadLocalDocumentSnapshot,
    saveLocalDocumentSnapshot,
} from '@/infrastructure/persistence/documentCommands.js';
import {
    hydratePersistenceSnapshot,
    usePersistenceBridgeState,
} from '@/ui/bridges/persistenceRuntimeFacade.js';
import { activateResolvedTemplateEnvironment } from '@/runtime/templates/activateResolvedTemplateEnvironment.js';
import { assertExclusiveInitialBootSources } from '@/ui/bridges/persistenceBootSources.js';

export function PersistenceBridge({
    enabled = true,
    initialDocumentId = null,
    initialEnvironmentDescriptor = null,
    initialResolvedTemplateEnvironment = null,
    initialRuntimeSnapshot = null,
    initialEvents = [],
    initialCursorIndex = -1,
    documentId = null,
    documentName = 'Untitled',
    onDocumentIdChange,
    onDocumentNameChange,
    onRecentDocsChange,
    onHydratedChange,
    workspace = null,
    mode = null,
}) {
    const dispatcher = useDispatcher();
    const events = usePersistenceBridgeState((s) => s.events);
    const cursorIndex = usePersistenceBridgeState((s) => s.cursorIndex);
    const autosaveTimerRef = useRef(null);
    const seededInitialSnapshotRef = useRef(false);
    const restoredPersistenceRef = useRef(false);

    useEffect(() => {
        onRecentDocsChange?.(loadRegistry());
    }, [onRecentDocsChange]);

    useEffect(() => {
        if (!dispatcher?.hydrateRuntimeState || seededInitialSnapshotRef.current) return;

        const {
            hasInitialEnvironmentDescriptor,
            hasInitialRuntimeSnapshot,
            hasInitialEvents,
            hasExplicitCursor,
        } = assertExclusiveInitialBootSources({
            initialEnvironmentDescriptor:
                initialResolvedTemplateEnvironment ?? initialEnvironmentDescriptor,
            initialRuntimeSnapshot,
            initialEvents,
            initialCursorIndex,
        });

        if (!hasInitialEnvironmentDescriptor && !hasInitialRuntimeSnapshot && !hasInitialEvents && !hasExplicitCursor) {
            seededInitialSnapshotRef.current = true;
            return;
        }

        if (hasInitialEnvironmentDescriptor) {
            activateResolvedTemplateEnvironment({
                resolved: initialResolvedTemplateEnvironment,
                dispatcher,
                animate: false,
            });
            seededInitialSnapshotRef.current = true;
            return;
        }

        hydratePersistenceSnapshot({
            dispatcher,
            snapshot: {
                runtimeSnapshot: hasInitialRuntimeSnapshot ? initialRuntimeSnapshot : null,
                events: initialEvents,
                cursorIndex: initialCursorIndex,
            },
            animate: false,
            workspace,
            mode,
        });
        seededInitialSnapshotRef.current = true;
    }, [dispatcher, initialEnvironmentDescriptor, initialResolvedTemplateEnvironment, initialEvents, initialCursorIndex, initialRuntimeSnapshot, mode, workspace]);

    useEffect(() => {
        if (!dispatcher?.hydrateRuntimeState || restoredPersistenceRef.current) return;

        const {
            hasInitialEnvironmentDescriptor,
            hasInitialRuntimeSnapshot,
            hasInitialEvents,
            hasExplicitCursor,
        } = assertExclusiveInitialBootSources({
            initialEnvironmentDescriptor:
                initialResolvedTemplateEnvironment ?? initialEnvironmentDescriptor,
            initialRuntimeSnapshot,
            initialEvents,
            initialCursorIndex,
        });

        if (hasInitialEnvironmentDescriptor || hasInitialRuntimeSnapshot || hasInitialEvents || hasExplicitCursor) {
            restoredPersistenceRef.current = true;
            onHydratedChange?.(true);
            return;
        }

        if (!enabled) {
            restoredPersistenceRef.current = true;
            onHydratedChange?.(true);
            return;
        }

        const activeId = initialDocumentId || getActiveDocument();
        if (activeId) {
            const loaded = loadLocalDocumentSnapshot(activeId);
            if (loaded?.snapshot) {
                hydratePersistenceSnapshot({
                    dispatcher,
                    snapshot: loaded.snapshot,
                    animate: false,
                    workspace,
                    mode,
                });
                onDocumentIdChange?.(activeId);
                onDocumentNameChange?.(loaded.name || 'Untitled');
                setActiveDocument(activeId);
                restoredPersistenceRef.current = true;
                onHydratedChange?.(true);
                return;
            }
        }

        const hydratedSnapshot = hydrateLocalDocumentSnapshot(loadLocalDocument());
        if (hydratedSnapshot) {
            hydratePersistenceSnapshot({
                dispatcher,
                snapshot: hydratedSnapshot,
                animate: false,
                workspace,
                mode,
            });
        }

        restoredPersistenceRef.current = true;
        onHydratedChange?.(true);
    }, [
        dispatcher,
        enabled,
        initialDocumentId,
        initialEnvironmentDescriptor,
        initialResolvedTemplateEnvironment,
        initialEvents,
        initialCursorIndex,
        initialRuntimeSnapshot,
        onDocumentIdChange,
        onDocumentNameChange,
        onHydratedChange,
        workspace,
        mode,
    ]);

    useEffect(() => {
        if (!enabled) return undefined;

        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
        }

        autosaveTimerRef.current = setTimeout(() => {
            const snapshot = createLocalDocumentSnapshot({
                events,
                cursorIndex,
                metadata: { name: documentName },
            });

            // LOCAL is canonical replay truth.
            saveLocalDocument(snapshot);

            if (documentId) {
                // Local per-document snapshots are still local authority,
                // not a remote persistence tier.
                saveLocalDocumentSnapshot({
                    id: documentId,
                    name: documentName,
                    events,
                    cursorIndex,
                });
                onRecentDocsChange?.(loadRegistry());
            }
        }, 250);

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
                autosaveTimerRef.current = null;
            }
        };
    }, [
        enabled,
        events,
        cursorIndex,
        documentId,
        documentName,
        onRecentDocsChange,
    ]);

    return null;
}
