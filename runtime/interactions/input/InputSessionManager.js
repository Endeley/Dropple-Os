import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { createSessionFromIntent } from '@/runtime/input/sessionRuntimeBridge.js';

let activeSession = null;
let activeSessionType = null;
let latestPreview = null;

function clearSession() {
  activeSession = null;
  activeSessionType = null;
  latestPreview = null;
}

export function beginSession({ type, payload }) {
  if (activeSession) {
    throw new Error('[inputSessionManager] Session already active');
  }

  const runtimeState = getRuntimeState();
  const nodesById = runtimeState?.nodes || {};

  const sessionPayload = { ...(payload || {}) };
  if (type === 'resize') {
    sessionPayload.nodeIds = [payload?.nodeId].filter(Boolean);
    sessionPayload.startPointer = payload?.pointerWorld;
    sessionPayload.handle = payload?.handleId;
  }
  if (type === 'rotate') {
    if (!sessionPayload.nodeIds && payload?.nodeId) {
      sessionPayload.nodeIds = [payload.nodeId];
    }
  }

  const session = createSessionFromIntent({
    sessionType: type,
    payload: sessionPayload,
    nodesById,
  });

  if (!session) return null;

  activeSession = session;
  activeSessionType = session.type;

  if (typeof session.onBegin === 'function') {
    session.onBegin(sessionPayload);
  } else {
    session.start?.(sessionPayload);
  }

  latestPreview = session.getPreview?.() ?? null;
  return latestPreview;
}

export function updatePointer({ pointer }) {
  if (!activeSession) return null;

  if (typeof activeSession.onPointerMove === 'function') {
    activeSession.onPointerMove(pointer);
  } else {
    activeSession.update?.(pointer);
  }

  latestPreview = activeSession.getPreview?.() ?? null;
  return latestPreview;
}

export function endSession({ reason } = {}) {
  if (!activeSession) return null;

  if (typeof activeSession.onPointerUp === 'function') {
    activeSession.onPointerUp({ reason });
  }

  const payload = activeSession.commit?.() ?? null;
  const event = { sessionType: activeSession.type, payload };

  clearSession();
  return event;
}

export function getPreview() {
  if (latestPreview) return latestPreview;
  return activeSession?.getPreview?.() ?? null;
}

export function getActiveSessionType() {
  return activeSessionType;
}
