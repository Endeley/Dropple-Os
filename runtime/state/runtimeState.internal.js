import { createTimeline } from '@/timeline/schema/timeline.js';

export const initialRuntimeState = {
  nodes: {},
  rootIds: [],
  timeline: null,
  activeStateId: null,
  activeComponentId: null,
  // 🔹 Narrative slice (runtime only)
  scene: {
    activeSceneId: null,
    activeShotId: null,
    camera: null,
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
