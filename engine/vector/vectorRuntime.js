import { EventTypes } from '@/core/events/eventTypes.js';

function requireDispatcher(dispatcher) {
  if (!dispatcher?.dispatch) {
    throw new Error('[VectorRuntime] dispatcher is required');
  }

  return dispatcher;
}

export async function createVector(node, { dispatcher } = {}) {
  const activeDispatcher = requireDispatcher(dispatcher);
  return activeDispatcher.dispatch({
    type: EventTypes.VECTOR_CREATE,
    payload: node,
  });
}

export async function updateVector(id, updates, { dispatcher } = {}) {
  const activeDispatcher = requireDispatcher(dispatcher);
  return activeDispatcher.dispatch({
    type: EventTypes.VECTOR_UPDATE,
    payload: {
      id,
      updates,
    },
  });
}

export async function deleteVector(id, { dispatcher } = {}) {
  const activeDispatcher = requireDispatcher(dispatcher);
  return activeDispatcher.dispatch({
    type: EventTypes.VECTOR_DELETE,
    payload: {
      id,
    },
  });
}
