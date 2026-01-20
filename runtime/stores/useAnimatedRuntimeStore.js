import { create } from 'zustand';

/**
 * AnimatedRuntimeStore
 *
 * Holds DERIVED visual state only.
 * This is NOT authoritative runtime truth.
 */
export const useAnimatedRuntimeStore = create(() => ({
    nodes: {},
    rootIds: [],
}));
