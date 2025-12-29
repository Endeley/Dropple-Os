'use client';

import { create } from 'zustand';

/**
 * Read-only animated mirror of runtime state for UI.
 * Animation frames write here; runtime state remains authoritative.
 */
export const useAnimatedRuntimeStore = create(() => ({
    nodes: {},
    rootIds: [],
}));
