import { createTimeline } from '@/timeline/schema/timeline.js';
import { createDefaultWorkspaceState } from './workspaceRuntime.js';
import { initialInteractionState } from '@/runtime/interactionEngine/state/interactionState.js';
import { createPreviewState } from '@/runtime/state/previewState.js';
import { createCanonicalDocumentEnvelope } from '@/core/persistence/documentEnvelope.js';
import { initialToolRuntimeState } from '@/runtime/tools/toolRuntime.js';
import { createInitialGraphInteractionState } from '@/core/events/graphInteractionState.js';
import { createInitialFederationAuditState } from '@/core/collaboration/federationAuditState.js';

export const initialRuntimeState = {
  document: createCanonicalDocumentEnvelope(),
  nodes: {},
  rootIds: [],
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
  clipboard: {
    nodes: [],
    rootIds: [],
  },
  components: {
    index: {},
    resolvedInstances: {},
  },
  data: {
    resolvedBindings: {},
    resolvedValues: {},
  },
  app: {
    screens: {},
    currentScreen: null,
    resolvedScreen: null,
    state: {},
    flows: {},
  },
  vectors: {},
  stateMachines: {},
  navigation: {},
  collaboration: {
    session: null,
    presence: {},
    cursors: {},
    federation: {
      sessions: {},
    },
  },
  federationAudit: createInitialFederationAuditState(),
  ai: {
    requests: {},
    order: [],
  },
  graph: createInitialGraphInteractionState(),
  tools: {
    ...initialToolRuntimeState,
  },
  interaction: initialInteractionState(),
  preview: createPreviewState(),
  events: [],
  cursorIndex: -1,
  // 🔹 Narrative slice (runtime only)
  scene: {
    activeSceneId: null,
    activeShotId: null,
    camera: null,
    temporalContext: null,
    computed: {},
    transformDirty: new Set(),
    layoutDirty: new Set(),
    paintDirty: new Set(),
    indexDirty: new Set(),
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
  if (!state?.interaction) {
    return {
      ...state,
      interaction: initialInteractionState(),
    };
  }
  return state;
}
