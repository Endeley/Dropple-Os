// runtime/stores/useRuntimeStore.js

import { create } from 'zustand';

/**
 * Read-only mirror of runtime state for React.
 * ❗ NEVER mutate from UI.
 */
export const useRuntimeStore = create((set) => ({
    document: null,
    viewNodes: {},
    viewRootIds: [],
    workspace: null,
    viewSceneGraph: null,
    scene: null,
    timeline: null,
    playback: { isPlaying: false },
    isReplaying: false,
    uxAudit: [],
    selection: { ids: [], primary: null, count: 0 },
    clipboard: { count: 0, hasData: false },
    grouping: { count: 0 },
    components: { index: {}, resolvedInstances: {} },
    data: { resolvedBindings: {}, resolvedValues: {} },
    app: { screens: {}, currentScreen: null, resolvedScreen: null, state: {}, flows: {} },
    vectors: {},
    stateMachines: {},
    navigation: {},
    collaboration: { session: null, presence: [], cursors: [] },
    ai: { requests: [], latestRequest: null },
    graph: {
        activeGraphId: null,
        activeGraph: null,
        nodes: [],
        edges: [],
        errors: [],
        selection: { ids: [], primary: null },
        viewport: { x: 0, y: 0, zoom: 1 },
        drag: { active: false, nodeId: null, origin: null, startPointer: null, currentPointer: null },
        connection: { active: false, fromNodeId: null, pointerX: 0, pointerY: 0 },
        dragPreviewPositions: {},
    },
    tools: { activeTool: 'select', registeredTools: {}, visibleTools: [] },
    interaction: null,
    selectionBounds: { bounds: null, center: null },
    transformAnchors: { pivot: null, resizeAnchors: null, rotateAnchor: null },
    guides: [],
    groupTransform: null,
    frameTime: 0,
    evaluatedScene: null,
    shotId: null,
    shotTimeMs: null,
    evalStatus: 'NO_SHOT',
    resizeDebug: '',

    // Event log mirror
    events: [],
    cursorIndex: -1,
}));
