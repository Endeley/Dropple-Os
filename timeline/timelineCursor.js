import { create } from 'zustand';

/**
 * Read-only timeline cursor for previewing state at time t.
 * No history, no persistence.
 */
export const useTimelineCursor = create(() => ({
    time: 0,
    setTime(time) {
        this.time = Math.max(0, time);
    },
}));
