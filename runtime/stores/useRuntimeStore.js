// runtime/stores/useRuntimeStore.js

import { create } from 'zustand';

/**
 * Read-only mirror of runtime state for React.
 * ❗ NEVER mutate from UI.
 */
export const useRuntimeStore = create((set) => ({
    nodes: {},
    rootIds: [],
    workspace: null,
    sceneGraph: null,
    scene: null,
    selection: { ids: [], primary: null, count: 0 },
    clipboard: { count: 0, hasData: false },
    grouping: { count: 0 },
    components: { index: {}, resolvedInstances: {} },
    data: { resolvedBindings: {}, resolvedValues: {} },
    app: { screens: {}, currentScreen: null, resolvedScreen: null, state: {}, flows: {} },
    stateMachines: {},
    navigation: {},
    selectionBounds: { bounds: null, center: null },
    transformAnchors: { pivot: null, resizeAnchors: null, rotateAnchor: null },
    guides: [],
    frameTime: 0,
    evaluatedScene: null,
    shotId: null,
    shotTimeMs: null,
    evalStatus: 'NO_SHOT',

    // Event log mirror
    events: [],
    cursorIndex: -1,

    setCursorIndex: (index) =>
        set(() => ({
            cursorIndex: index,
        })),
}));
