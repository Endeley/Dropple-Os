'use client';

import { useCallback, useEffect, useRef } from 'react';
import { serializeWorld, hydrateWorld, roundTripWorldState } from '@/runtime/persistence/worldRuntimeBridge.js';
import { useDispatcher } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';

const SAVE_DEBOUNCE_MS = 300;
const CAMERA_THROTTLE_MS = 200;

export function useWorldPersistence({
    workspaceId,
    viewport,
    nodesById,
    persistenceAdapter,
}) {
    const dispatcher = useDispatcher();
    const loadedRef = useRef(false);
    const metaRef = useRef(null);
    const saveTimerRef = useRef(null);
    const cameraTimerRef = useRef(null);
    const lastSavedRef = useRef(null);

    function ensureMeta() {
        if (!metaRef.current) {
            const now = Date.now();
            metaRef.current = {
                createdAt: now,
                updatedAt: now,
            };
        }
    }

    const flushSave = useCallback(() => {
        if (!loadedRef.current) return;
        if (!viewport || !nodesById) return;

        ensureMeta();
        metaRef.current.updatedAt = Date.now();
        const payload = serializeWorld({
            nodesById,
            viewport,
            workspaceId,
            metadata: metaRef.current,
        });
        if (!payload) return;
        const serialized = JSON.stringify(payload);
        if (serialized === lastSavedRef.current) return;
        if (typeof persistenceAdapter?.save === 'function') {
            persistenceAdapter.save(workspaceId, payload);
        }
        lastSavedRef.current = serialized;
    }, [nodesById, viewport, workspaceId, persistenceAdapter]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (loadedRef.current) return;

        const loaded =
            typeof persistenceAdapter?.load === 'function'
                ? persistenceAdapter.load(workspaceId)
                : null;
        if (loaded) {
            metaRef.current = {
                createdAt: loaded.metadata?.createdAt ?? Date.now(),
                updatedAt: loaded.metadata?.updatedAt ?? Date.now(),
            };
            hydrateWorld(loaded, { dispatcher });
        } else {
            ensureMeta();
        }

        loadedRef.current = true;

        if (process.env.NODE_ENV === 'development') {
            const previous = window.__droppleDebug;
            const api = {
                ...(previous || {}),
                worldRoundTrip() {
                    return roundTripWorldState({
                        nodesById,
                        viewport,
                        workspaceId,
                        metadata: metaRef.current,
                        dispatcher,
                    });
                },
                worldSave() {
                    flushSave();
                    return true;
                },
            };
            window.__droppleDebug = api;
        }
    }, [nodesById, viewport, workspaceId, flushSave, dispatcher, persistenceAdapter]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                flushSave();
            }
        };

        const handleBeforeUnload = () => {
            flushSave();
        };

        const handlePageHide = () => {
            flushSave();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [nodesById, viewport, workspaceId, flushSave]);

    useEffect(() => {
        if (!loadedRef.current) return;
        if (!viewport || !nodesById) return;

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(() => {
            flushSave();
        }, SAVE_DEBOUNCE_MS);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
        };
    }, [nodesById, viewport, workspaceId, flushSave]);

    useEffect(() => {
        if (!loadedRef.current) return;
        if (!viewport) return;

        if (cameraTimerRef.current) {
            clearTimeout(cameraTimerRef.current);
        }

        cameraTimerRef.current = setTimeout(() => {
            flushSave();
        }, CAMERA_THROTTLE_MS);

        return () => {
            if (cameraTimerRef.current) {
                clearTimeout(cameraTimerRef.current);
                cameraTimerRef.current = null;
            }
        };
    }, [viewport, workspaceId, flushSave]);
}
