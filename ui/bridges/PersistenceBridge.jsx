'use client';

import { useCallback, useEffect, useRef } from 'react';
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
import {
    assertExclusiveInitialBootSources,
    resolveInitialEnvironmentBoot,
} from '@/ui/bridges/persistenceBootSources.js';

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
    const latestSnapshotRef = useRef({
        events: [],
        cursorIndex: -1,
        documentId: null,
        documentName: 'Untitled',
        workspace: null,
        mode: null,
    });
    const seededInitialSnapshotRef = useRef(false);
    const restoredPersistenceRef = useRef(false);
    const initialResolvedEnvironment = resolveInitialEnvironmentBoot({
        initialEnvironmentDescriptor,
        initialResolvedTemplateEnvironment,
    });

    useEffect(() => {
        onRecentDocsChange?.(loadRegistry());
    }, [onRecentDocsChange]);

    const persistLatestSnapshot = useCallback(() => {
        if (!enabled) return;

        const latest = latestSnapshotRef.current ?? {};
        const snapshot = createLocalDocumentSnapshot({
            events: Array.isArray(latest.events) ? latest.events : [],
            cursorIndex: Number.isFinite(latest.cursorIndex) ? latest.cursorIndex : -1,
            metadata: { name: latest.documentName ?? 'Untitled' },
        });

        saveLocalDocument(snapshot);

        if (latest.documentId) {
            saveLocalDocumentSnapshot({
                id: latest.documentId,
                name: latest.documentName ?? 'Untitled',
                events: Array.isArray(latest.events) ? latest.events : [],
                cursorIndex: Number.isFinite(latest.cursorIndex) ? latest.cursorIndex : -1,
                metadata: {
                    workspace: latest.workspace ?? null,
                    mode: latest.mode ?? null,
                },
            });
            onRecentDocsChange?.(loadRegistry());
        }
    }, [enabled, onRecentDocsChange]);

    useEffect(() => {
        latestSnapshotRef.current = {
            events,
            cursorIndex,
            documentId,
            documentName,
            workspace,
            mode,
        };
    }, [cursorIndex, documentId, documentName, events, mode, workspace]);

    useEffect(() => {
        if (!dispatcher?.hydrateRuntimeState || seededInitialSnapshotRef.current) return;

        const {
            hasInitialEnvironmentDescriptor,
            hasInitialRuntimeSnapshot,
            hasInitialEvents,
            hasExplicitCursor,
        } = assertExclusiveInitialBootSources({
            initialEnvironmentDescriptor:
                initialResolvedEnvironment,
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
                resolved: initialResolvedEnvironment,
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
    }, [dispatcher, initialEvents, initialCursorIndex, initialResolvedEnvironment, initialRuntimeSnapshot, mode, workspace]);

    useEffect(() => {
        if (!dispatcher?.hydrateRuntimeState || restoredPersistenceRef.current) return;

        const {
            hasInitialEnvironmentDescriptor,
            hasInitialRuntimeSnapshot,
            hasInitialEvents,
            hasExplicitCursor,
        } = assertExclusiveInitialBootSources({
            initialEnvironmentDescriptor:
                initialResolvedEnvironment,
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
        initialEvents,
        initialCursorIndex,
        initialResolvedEnvironment,
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
            persistLatestSnapshot();
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
        mode,
        onRecentDocsChange,
        persistLatestSnapshot,
        workspace,
    ]);

    useEffect(() => {
        if (typeof window === 'undefined' || !enabled) return undefined;

        const flushPendingSnapshot = () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
                autosaveTimerRef.current = null;
            }
            persistLatestSnapshot();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                flushPendingSnapshot();
            }
        };

        window.addEventListener('beforeunload', flushPendingSnapshot);
        window.addEventListener('pagehide', flushPendingSnapshot);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', flushPendingSnapshot);
            window.removeEventListener('pagehide', flushPendingSnapshot);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, persistLatestSnapshot]);

    return null;
}
