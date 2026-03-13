import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

function resolveState({ runtimeState, dispatcher } = {}) {
  if (runtimeState) return runtimeState;
  if (dispatcher?.getState) return dispatcher.getState();
  try {
    return getRuntimeDispatcher().getState();
  } catch {
    return getRuntimeState();
  }
}

export async function updateCursor(userId, position, { dispatcher } = {}) {
  if (!userId) {
    throw new Error('Cursor update requires userId');
  }

  if (typeof position?.x !== 'number' || typeof position?.y !== 'number') {
    throw new Error('Cursor position requires numeric x and y');
  }

  const activeDispatcher = dispatcher || getRuntimeDispatcher();

  return activeDispatcher.dispatch({
    type: EventTypes.COLLABORATION_CURSOR_UPDATE,
    payload: {
      userId,
      position: {
        x: position.x,
        y: position.y,
        updatedAt: position.updatedAt ?? Date.now(),
      },
    },
  });
}

export async function removeCursor(userId, { dispatcher } = {}) {
  if (!userId) {
    return null;
  }

  const activeDispatcher = dispatcher || getRuntimeDispatcher();

  return activeDispatcher.dispatch({
    type: EventTypes.COLLABORATION_CURSOR_REMOVE,
    payload: {
      userId,
    },
  });
}

export function getCursors(options = {}) {
  const cursors = resolveState(options)?.collaboration?.cursors ?? {};
  return Object.entries(cursors)
    .map(([userId, cursor]) => ({
      userId,
      ...cursor,
    }))
    .sort((a, b) => String(a.userId).localeCompare(String(b.userId)));
}
