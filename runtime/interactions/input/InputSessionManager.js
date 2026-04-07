/**
 * NON-CANONICAL INTERACTION SYSTEM
 *
 * Canvas authoring uses:
 * WorkspaceCanvasRoot -> CanvasRoot -> useCanvasInteractions -> inputEngine -> toolHandlerRegistrationFacade
 *
 * This manager may remain for preview or non-canvas session flows, but it must
 * not become a competing execution authority for canvas drag, move, resize, or
 * rotate behavior.
 */

import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { createSessionFromIntent } from '@/runtime/input/sessionRuntimeBridge.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

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
  const nodesById = getNodes(runtimeState);
  const projection = useRuntimeStore.getState();

  const sessionPayload = { ...(payload || {}) };
  if (type === 'move') {
    sessionPayload.startPointer =
      payload?.startPointer ?? payload?.pointer ?? payload?.pointerWorld;
  }
  if (type === 'resize') {
    if (Array.isArray(payload?.nodeIds) && payload.nodeIds.length) {
      sessionPayload.nodeIds = payload.nodeIds;
    } else {
      sessionPayload.nodeIds = [payload?.nodeId].filter(Boolean);
    }
    sessionPayload.startPointer =
      payload?.startPointer ?? payload?.pointerWorld ?? payload?.pointer;
    sessionPayload.handle = payload?.handleId;
    sessionPayload.bounds = payload?.bounds ?? projection?.selectionBounds?.bounds ?? null;
  }
  if (type === 'rotate') {
    if (!sessionPayload.nodeIds && payload?.nodeId) {
      sessionPayload.nodeIds = [payload.nodeId];
    }
    sessionPayload.startPointerWorld =
      payload?.startPointerWorld ?? payload?.pointerWorld ?? payload?.pointer;
    sessionPayload.pivot = payload?.pivot ?? projection?.transformAnchors?.pivot ?? null;
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
