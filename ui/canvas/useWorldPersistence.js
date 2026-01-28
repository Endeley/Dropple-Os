'use client';

import { useEffect, useRef } from 'react';
import { WorldStore } from '@/persistence/worldStore.js';
import { serializeWorld, hydrateWorld, roundTripWorldState } from '@/persistence/worldState.js';

const SAVE_DEBOUNCE_MS = 300;
const CAMERA_THROTTLE_MS = 200;

export function useWorldPersistence({
    workspaceId,
    viewport,
    nodesById,
}) {
    const loadedRef = useRef(false);
    const metaRef = useRef({
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
    const saveTimerRef = useRef(null);
    const cameraTimerRef = useRef(null);
    const lastSavedRef = useRef(null);

    function flushSave() {
        if (!loadedRef.current) return;
        if (!viewport || !nodesById) return;

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
        WorldStore.save(workspaceId, payload);
        lastSavedRef.current = serialized;
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (loadedRef.current) return;

        const loaded = WorldStore.load(workspaceId);
        if (loaded) {
            metaRef.current = {
                createdAt: loaded.metadata?.createdAt ?? Date.now(),
                updatedAt: loaded.metadata?.updatedAt ?? Date.now(),
            };
            hydrateWorld(loaded);
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
                    });
                },
                worldSave() {
                    flushSave();
                    return true;
                },
            };
            window.__droppleDebug = api;
        }
    }, [nodesById, viewport, workspaceId]);

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
    }, [nodesById, viewport, workspaceId]);

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
    }, [nodesById, workspaceId]);

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
    }, [viewport?.x, viewport?.y, viewport?.scale, workspaceId]);
}
