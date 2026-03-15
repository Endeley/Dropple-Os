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
import { loadDocumentSnapshot, saveDocumentSnapshot } from '@/infrastructure/persistence/documentCommands.js';
import {
    hydratePersistenceSnapshot,
    usePersistenceBridgeState,
} from '@/ui/bridges/persistenceRuntimeFacade.js';

export function PersistenceBridge({
    enabled = true,
    initialDocumentId = null,
    initialEvents = [],
    initialCursorIndex = -1,
    documentId = null,
    documentName = 'Untitled',
    onDocumentIdChange,
    onDocumentNameChange,
    onRecentDocsChange,
    onHydratedChange,
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

        const hasInitialSnapshot =
            Array.isArray(initialEvents) && initialEvents.length > 0;
        const hasExplicitCursor = typeof initialCursorIndex === 'number' && initialCursorIndex >= 0;

        if (!hasInitialSnapshot && !hasExplicitCursor) {
            seededInitialSnapshotRef.current = true;
            return;
        }

        hydratePersistenceSnapshot({
            dispatcher,
            snapshot: {
                events: initialEvents,
                cursorIndex: initialCursorIndex,
            },
            animate: false,
        });
        seededInitialSnapshotRef.current = true;
    }, [dispatcher, initialEvents, initialCursorIndex]);

    useEffect(() => {
        if (!dispatcher?.hydrateRuntimeState || restoredPersistenceRef.current) return;

        if (!enabled) {
            restoredPersistenceRef.current = true;
            onHydratedChange?.(true);
            return;
        }

        const activeId = initialDocumentId || getActiveDocument();
        if (activeId) {
            const loaded = loadDocumentSnapshot(activeId);
            if (loaded?.snapshot) {
                hydratePersistenceSnapshot({
                    dispatcher,
                    snapshot: loaded.snapshot,
                    animate: false,
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
            });
        }

        restoredPersistenceRef.current = true;
        onHydratedChange?.(true);
    }, [
        dispatcher,
        enabled,
        initialDocumentId,
        onDocumentIdChange,
        onDocumentNameChange,
        onHydratedChange,
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
            saveLocalDocument(snapshot);

            if (documentId) {
                saveDocumentSnapshot({
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
