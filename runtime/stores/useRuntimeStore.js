// runtime/stores/useRuntimeStore.js

import { create } from 'zustand';

/**
 * Read-only mirror of runtime state for React.
 * ❗ NEVER mutate from UI.
 */
export const useRuntimeStore = create(() => ({
    nodes: {},
    rootIds: [],
    workspace: null,
    sceneGraph: null,
    scene: null,
    selection: { ids: [] },
    frameTime: 0,
    evaluatedScene: null,
    shotId: null,
    shotTimeMs: null,
    evalStatus: 'NO_SHOT',
}));
