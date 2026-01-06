// timeline/markers/useTimelineMarkers.js

import { create } from 'zustand';

/**
 * Timeline markers store.
 *
 * 🔒 Rules:
 * - UI-only
 * - NOT persisted
 * - NOT replayed
 * - Safe to clear/reset
 */
export const useTimelineMarkers = create((set, get) => ({
    inPoint: null, // number | null
    outPoint: null, // number | null

    markers: [], // [{ id, time, label }]

    // --- In / Out ---

    setInPoint(time) {
        set({ inPoint: time });
    },

    setOutPoint(time) {
        set({ outPoint: time });
    },

    clearInOut() {
        set({ inPoint: null, outPoint: null });
    },

    // --- Markers ---

    addMarker({ id, time, label = '' }) {
        set({
            markers: [...get().markers, { id, time, label }],
        });
    },

    removeMarker(id) {
        set({
            markers: get().markers.filter((m) => m.id !== id),
        });
    },

    updateMarker(id, updates) {
        set({
            markers: get().markers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        });
    },

    getMarkerTimes() {
        return get().markers.map((m) => m.time);
    },
}));
