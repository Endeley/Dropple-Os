/**
 * PUBLIC RUNTIME API
 * No mutation exposed.
 * Runtime state is projection-only outside dispatcher.
 */

import {
  __getRuntimeStateInternal,
  __getIsReplayingInternal,
  __getRuntimeErrorInternal,
} from './runtimeState.internal.js';

function deepFreezeDev(obj) {
  if (process.env.NODE_ENV !== 'development') return obj;
  if (!obj || typeof obj !== 'object') return obj;

  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] &&
      typeof obj[prop] === 'object' &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreezeDev(obj[prop]);
    }
  });

  return obj;
}

export function getRuntimeState() {
  const state = __getRuntimeStateInternal();
  if (!state) return state;

  const snapshot = structuredClone(state);
  return deepFreezeDev(snapshot);
}

export function getIsReplaying() {
  return __getIsReplayingInternal();
}

export function getRuntimeError() {
  return __getRuntimeErrorInternal();
}
