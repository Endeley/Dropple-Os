import { initialDragState } from '@/runtime/interaction/dragRuntime.js';

export const initialInteractionState = () => ({
  activeInteraction: null,
  phase: 'idle',
  pointerStart: null,
  pointerCurrent: null,
  nodeIds: [],
  graph: null,
  drag: initialDragState,
});

export function setActiveInteraction(runtime, type, payload = {}) {
  runtime.interaction = {
    activeInteraction: type,
    phase: 'active',
    pointerStart: payload.pointerStart ?? null,
    pointerCurrent: payload.pointerStart ?? null,
    nodeIds: payload.nodeIds || [],
    graph: payload.graph ?? null,
  };

  return runtime.interaction;
}

export function updatePointer(runtime, pointer) {
  if (!runtime?.interaction) {
    runtime.interaction = initialInteractionState();
  }

  runtime.interaction.pointerCurrent = pointer ?? null;
  return runtime.interaction;
}

export function clearInteraction(runtime) {
  runtime.interaction = initialInteractionState();
  return runtime.interaction;
}
