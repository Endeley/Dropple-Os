'use client';

import { useEffect, useRef } from 'react';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { hydrateRuntimeSnapshot } from '@/runtime/commands/hydrateRuntimeSnapshot.js';
import { createLocalDocumentSnapshot, hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema.js';
import { loadLocalDocument, saveLocalDocument } from '@/persistence/localDocumentStore.js';
import { getActiveDocument, setActiveDocument } from '@/persistence/activeDocument.js';
import { loadRegistry } from '@/persistence/documentRegistry.js';
import { loadDocumentSnapshot, saveDocumentSnapshot } from '@/persistence/documentCommands.js';

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
    const events = useRuntimeStore((s) => s.events);
    const cursorIndex = useRuntimeStore((s) => s.cursorIndex);
    const autosaveTimerRef = useRef(null);

    useEffect(() => {
        onRecentDocsChange?.(loadRegistry());
    }, [onRecentDocsChange]);

    useEffect(() => {
        if (!dispatcher?.hydrateRuntimeState) return;

        hydrateRuntimeSnapshot({
            dispatcher,
            snapshot: {
                events: initialEvents,
                cursorIndex: initialCursorIndex,
            },
            animate: false,
        });
    }, [dispatcher, initialEvents, initialCursorIndex]);

    useEffect(() => {
        if (!enabled) {
            onHydratedChange?.(true);
            return;
        }

        const activeId = initialDocumentId || getActiveDocument();
        if (activeId) {
            const loaded = loadDocumentSnapshot(activeId);
            if (loaded?.snapshot) {
                hydrateRuntimeSnapshot({
                    dispatcher,
                    snapshot: loaded.snapshot,
                    animate: false,
                });
                onDocumentIdChange?.(activeId);
                onDocumentNameChange?.(loaded.name || 'Untitled');
                setActiveDocument(activeId);
                onHydratedChange?.(true);
                return;
            }
        }

        const hydratedSnapshot = hydrateLocalDocumentSnapshot(loadLocalDocument());
        if (hydratedSnapshot) {
            hydrateRuntimeSnapshot({
                dispatcher,
                snapshot: hydratedSnapshot,
                animate: false,
            });
        }

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
