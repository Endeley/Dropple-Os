// persistence/useAutosave.js

import { useEffect, useRef } from 'react';
import { getRuntimeState, getRuntimeError } from '@/runtime/state/runtimeState';
import { useSaveCurrentDocument } from './saveCurrentDocument';

/**
 * Debounced autosave for document snapshots.
 *
 * 🔒 Rules:
 * - Uses existing snapshot mutation
 * - Debounced (default 3s)
 * - Paused during load/replay
 * - Event-count based change detection
 */
export function useAutosave({ enabled = true, debounceMs = 3000, pauseRef } = {}) {
    const saveSnapshot = useSaveCurrentDocument();

    const lastEventCountRef = useRef(0);
    const timerRef = useRef(null);
    const inFlightRef = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        const tick = () => {
            if (pauseRef?.current) return;

            if (getRuntimeError()) return;

            const state = getRuntimeState();
            const doc = state?.document;
            if (!doc) return;

            // Count total events across branches
            const totalEvents = Object.values(doc.branches || {}).reduce((sum, b) => sum + (b.events?.length ?? 0), 0);

            // No changes → nothing to do
            if (totalEvents === lastEventCountRef.current) return;

            // Debounce
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(async () => {
                if (inFlightRef.current) return;

                try {
                    inFlightRef.current = true;
                    await saveSnapshot();
                    lastEventCountRef.current = totalEvents;
                } catch (err) {
                    console.error('Autosave failed:', err);
                } finally {
                    inFlightRef.current = false;
                }
            }, debounceMs);
        };

        const id = setInterval(tick, 500); // lightweight poll
        return () => {
            clearInterval(id);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [enabled, debounceMs, pauseRef, saveSnapshot]);
}
