// runtime/stores/useRuntimeStore.js

import { create } from 'zustand';

/**
 * Read-only mirror of runtime state for React.
 * ❗ NEVER mutate from UI.
 */
export const useRuntimeStore = create(() => ({
    nodes: {},
    rootIds: [],
    sceneGraph: null,
    scene: null,
}));
