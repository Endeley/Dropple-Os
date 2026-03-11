import { createTimeline } from '@/timeline/schema/timeline.js';
import { createDefaultWorkspaceState } from './workspaceRuntime.js';

function createInitialDocument() {
  const now = Date.now();

  return {
    meta: {
      id: crypto.randomUUID(),
      name: 'Untitled',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    sceneGraph: {
      rootIds: [],
      nodes: {},
    },
    layout: {
      version: 1,
      nodes: {},
      computed: {},
      dirty: {
        nodeIds: [],
        fullPass: false,
        revision: 0,
      },
      metadata: {
        schemaVersion: 1,
      },
    },
    components: {
      definitions: {},
      instances: {},
    },
    motion: {
      clips: {},
    },
    scenes: {
      scenes: {},
      activeSceneId: undefined,
    },
    assets: {
      images: {},
      videos: {},
      audio: {},
    },
    exports: {
      targets: [],
    },
  };
}

export const initialRuntimeState = {
  document: createInitialDocument(),
  nodes: {},
  rootIds: [],
  sceneGraph: null,
  timeline: null,
  history: null,
  workspace: createDefaultWorkspaceState(),
  playback: {
    isPlaying: false,
  },
  activeStateId: null,
  activeComponentId: null,
  selection: {
    ids: new Set(),
    primary: null,
  },
  // 🔹 Narrative slice (runtime only)
  scene: {
    activeSceneId: null,
    activeShotId: null,
    camera: null,
    computed: {},
    layoutRoots: new Map(),
    dependencyGraph: null,
    spatialIndex: null,
  },
  __isReplaying: false,
};

const runtimeState = {
  current: undefined,
  __isReplaying: false,
};

let lastError = null;

/**
 * INTERNAL — DO NOT EXPORT OUTSIDE runtime/
 */

export function __getRuntimeStateInternal() {
  return runtimeState.current;
}

export function __setRuntimeStateInternal(nextState, origin = null) {
  if (origin !== 'dispatcher' && origin !== 'system') {
    throw new Error(
      '[Dropple Runtime Violation] runtimeState mutation outside dispatcher'
    );
  }

  runtimeState.current = nextState
    ? { ...nextState, __isReplaying: runtimeState.__isReplaying }
    : nextState;

  lastError = null;
  return runtimeState.current;
}

export function __resetRuntimeStateInternal() {
  runtimeState.current = undefined;
  lastError = null;
}

export function __setIsReplayingInternal(value) {
  runtimeState.__isReplaying = Boolean(value);

  if (!runtimeState.current) {
    runtimeState.current = {
      ...initialRuntimeState,
      __isReplaying: runtimeState.__isReplaying,
    };
    return;
  }

  runtimeState.current = {
    ...runtimeState.current,
    __isReplaying: runtimeState.__isReplaying,
  };
}

export function __getIsReplayingInternal() {
  return runtimeState.__isReplaying;
}

export function __setRuntimeErrorInternal(err) {
  lastError = err;
}

export function __getRuntimeErrorInternal() {
  return lastError;
}

export function __ensureDefaultTimelineInternal(state) {
  if (!state?.timeline?.timelines?.default) {
    return {
      ...state,
      timeline: {
        timelines: {
          default: createTimeline(),
        },
      },
    };
  }
  return state;
}

export function __ensureDefaultWorkspaceInternal(state) {
  if (!state?.workspace) {
    return {
      ...state,
      workspace: createDefaultWorkspaceState(),
    };
  }
  return state;
}
