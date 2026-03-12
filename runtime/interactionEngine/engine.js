import { resolveIntent } from './intentResolver.js';
import { getInteraction } from './interactionRegistry.js';
import { executeGraph } from './graphExecutor.js';
import {
  setActiveInteraction,
  updatePointer,
  clearInteraction,
} from './state/interactionState.js';
import { applyPreviewPatch, clearPreviewPatch } from '@/runtime/preview/index.js';

function dispatchEvent(dispatcher, event) {
  if (!event) return;

  if (typeof dispatcher === 'function') {
    dispatcher(event);
    return;
  }

  if (typeof dispatcher?.dispatch === 'function') {
    dispatcher.dispatch(event);
  }
}

export function createInteractionEngine(runtime, dispatcher) {
  function start(input = {}) {
    const type = resolveIntent(input, { runtime });
    const factory = getInteraction(type);

    if (!factory) {
      throw new Error(`Unknown interaction: ${type}`);
    }

    const graph = factory(input, runtime);

    setActiveInteraction(runtime, type, {
      pointerStart: input.pointer,
      nodeIds: input.nodeIds,
      graph,
    });

    return runtime.interaction;
  }

  function update(pointer) {
    updatePointer(runtime, pointer);

    const graph = runtime?.interaction?.graph;
    const previewPatch = executeGraph(graph, {
      runtime,
      pointer,
    });

    applyPreviewPatch(runtime, previewPatch);
    return runtime.preview;
  }

  function commit() {
    const interaction = runtime?.interaction;
    if (!interaction?.graph) return null;

    const result = executeGraph(interaction.graph, { runtime });

    if (Array.isArray(result.events)) {
      for (const event of result.events) {
        dispatchEvent(dispatcher, event);
      }
    }

    clearPreviewPatch(runtime);
    clearInteraction(runtime);
    return result;
  }

  function cancel() {
    clearPreviewPatch(runtime);
    clearInteraction(runtime);
  }

  return {
    start,
    update,
    commit,
    cancel,
  };
}
