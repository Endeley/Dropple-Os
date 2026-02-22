import { validateBehaviorGraph } from '@/core/contracts/BehaviorGraphContract.js';
import { EventTypes } from '@/core/events/eventTypes.js';

// ---- override filtering (STRICT) ----
// Adjust allowlist paths to match your canonical node shape.
const FORBIDDEN_TOP_KEYS = new Set([
  'id',
  'type',
  'parentId',
  'children',
  'tree',
  'world',
  'behaviors',
  'behaviorRuntime',
]);

const ALLOWED_TOP_KEYS = new Set([
  'layout',
  'style',
  'content',
  'transform',
  'visible',
  'opacity',
]);

function filterBehaviorOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object') return {};

  const out = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (FORBIDDEN_TOP_KEYS.has(k)) {
      throw new Error(`Behavior override touches forbidden key: ${k}`);
    }
    if (!ALLOWED_TOP_KEYS.has(k)) {
      throw new Error(`Behavior override touches unknown key: ${k}`);
    }
    out[k] = v;
  }
  return out;
}

function findState(graph, stateId) {
  return graph.states.find((s) => s.id === stateId) ?? null;
}

function findTransition(graph, fromStateId, toStateId) {
  return (
    graph.transitions.find(
      (t) => t.fromStateId === fromStateId && t.toStateId === toStateId
    ) ?? null
  );
}

function normalizeStateInput(state) {
  if (!state || typeof state !== 'object') {
    throw new Error('BEHAVIOR_STATE_CREATE requires state object');
  }
  const { id, label = '', propertyOverrides = {} } = state;
  if (!id) throw new Error('BehaviorState requires an id');
  const overrides = filterBehaviorOverrides(propertyOverrides);
  return { id, label, propertyOverrides: overrides };
}

function applyStatePatch(state, patch) {
  if (!patch || typeof patch !== 'object') return state;
  if (Object.prototype.hasOwnProperty.call(patch, 'id')) {
    throw new Error('BehaviorState patch cannot change id');
  }
  const next = { ...state };
  if (Object.prototype.hasOwnProperty.call(patch, 'label')) {
    next.label = patch.label ?? '';
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'propertyOverrides')) {
    next.propertyOverrides = filterBehaviorOverrides(patch.propertyOverrides);
  }
  return next;
}

// ---- apply patch to node (pure) ----
// Adjust this to your actual node storage location.
// Common patterns:
// - world.nodes[entityId]
// - world.scene.nodes[entityId]
// - world.tree.nodes[entityId]
function applyNodePatch(world, entityId, patch) {
  const nodes = world.nodes;
  if (!nodes || !nodes[entityId]) {
    throw new Error(`BEHAVIOR_STATE_COMMIT: node not found: ${entityId}`);
  }

  const prev = nodes[entityId];
  // shallow merge top-level domains; deeper merge per domain
  const next = { ...prev };

  if (patch.layout) next.layout = { ...(prev.layout ?? {}), ...patch.layout };
  if (patch.style) next.style = { ...(prev.style ?? {}), ...patch.style };
  if (patch.content)
    next.content = { ...(prev.content ?? {}), ...patch.content };
  if (patch.transform)
    next.transform = { ...(prev.transform ?? {}), ...patch.transform };

  if (typeof patch.visible === 'boolean') next.visible = patch.visible;
  if (typeof patch.opacity === 'number') next.opacity = patch.opacity;

  nodes[entityId] = next;
}

export function behaviorReducers(world, event, ctx) {
  switch (event.type) {
    case EventTypes.BEHAVIOR_STATE_CREATE: {
      const { entityId, state } = event.payload ?? {};
      if (!entityId) throw new Error('BEHAVIOR_STATE_CREATE requires entityId');

      const behaviors = world.behaviors || {};
      const graph = behaviors[entityId];
      if (!graph)
        throw new Error(`No BehaviorGraph found for entityId: ${entityId}`);

      const nextState = normalizeStateInput(state);
      if (nextState.id === graph.baseStateId) {
        throw new Error('BehaviorState id cannot equal baseStateId');
      }
      if (findState(graph, nextState.id)) {
        throw new Error(`BehaviorState already exists: ${nextState.id}`);
      }

      const nextGraph = {
        ...graph,
        states: [...(graph.states || []), nextState],
      };

      validateBehaviorGraph(nextGraph);

      return {
        ...world,
        behaviors: {
          ...behaviors,
          [entityId]: nextGraph,
        },
      };
    }

    case EventTypes.BEHAVIOR_STATE_UPDATE: {
      const { entityId, stateId, patch } = event.payload ?? {};
      if (!entityId) throw new Error('BEHAVIOR_STATE_UPDATE requires entityId');
      if (!stateId) throw new Error('BEHAVIOR_STATE_UPDATE requires stateId');

      const behaviors = world.behaviors || {};
      const graph = behaviors[entityId];
      if (!graph)
        throw new Error(`No BehaviorGraph found for entityId: ${entityId}`);

      const existing = findState(graph, stateId);
      if (!existing) {
        throw new Error(`BehaviorState does not exist: ${stateId}`);
      }

      const nextStates = (graph.states || []).map((s) =>
        s.id === stateId ? applyStatePatch(s, patch) : s
      );

      const nextGraph = {
        ...graph,
        states: nextStates,
      };

      validateBehaviorGraph(nextGraph);

      return {
        ...world,
        behaviors: {
          ...behaviors,
          [entityId]: nextGraph,
        },
      };
    }

    case EventTypes.BEHAVIOR_STATE_DELETE: {
      const { entityId, stateId } = event.payload ?? {};
      if (!entityId) throw new Error('BEHAVIOR_STATE_DELETE requires entityId');
      if (!stateId) throw new Error('BEHAVIOR_STATE_DELETE requires stateId');

      const behaviors = world.behaviors || {};
      const graph = behaviors[entityId];
      if (!graph)
        throw new Error(`No BehaviorGraph found for entityId: ${entityId}`);

      if (stateId === graph.baseStateId) {
        throw new Error('Cannot delete baseStateId');
      }
      if (!findState(graph, stateId)) {
        throw new Error(`BehaviorState does not exist: ${stateId}`);
      }

      const nextStates = (graph.states || []).filter((s) => s.id !== stateId);
      const nextTransitions = (graph.transitions || []).filter(
        (t) => t.fromStateId !== stateId && t.toStateId !== stateId
      );
      const nextTriggers = (graph.triggers || []).filter(
        (t) => t.fromStateId !== stateId && t.toStateId !== stateId
      );

      const nextGraph = {
        ...graph,
        states: nextStates,
        transitions: nextTransitions,
        triggers: nextTriggers,
      };

      validateBehaviorGraph(nextGraph);

      const behaviorRuntime = world.behaviorRuntime || {};
      const runtime = behaviorRuntime[entityId] || {};
      const shouldResetRuntime = runtime.currentStateId === stateId;

      return {
        ...world,
        behaviors: {
          ...behaviors,
          [entityId]: nextGraph,
        },
        behaviorRuntime: shouldResetRuntime
          ? {
              ...behaviorRuntime,
              [entityId]: {
                ...runtime,
                currentStateId: graph.baseStateId,
              },
            }
          : behaviorRuntime,
      };
    }

    case EventTypes.BEHAVIOR_STATE_COMMIT: {
      const { entityId, targetStateId } = event.payload ?? {};
      if (!entityId) throw new Error('BEHAVIOR_STATE_COMMIT requires entityId');
      if (!targetStateId)
        throw new Error('BEHAVIOR_STATE_COMMIT requires targetStateId');

      const behaviors = world.behaviors || {};
      const behaviorRuntime = world.behaviorRuntime || {};

      const graph = behaviors[entityId];
      if (!graph)
        throw new Error(`No BehaviorGraph found for entityId: ${entityId}`);

      validateBehaviorGraph(graph);

      const runtime = behaviorRuntime[entityId] || {};
      const currentStateId = runtime.currentStateId ?? graph.baseStateId;

      const targetState = findState(graph, targetStateId);
      if (!targetState) {
        throw new Error(
          `Target state does not exist: ${targetStateId} (entity ${entityId})`
        );
      }

      const transition =
        findTransition(graph, currentStateId, targetStateId) ?? null;

      // Canonical commit (truth changes immediately)
      const nextRuntime = {
        ...runtime,
        currentStateId: targetStateId,
        // Store only descriptive info (safe for preview/devtools)
        lastTransition: {
        fromStateId: currentStateId,
        toStateId: targetStateId,
        presetId: transition?.meta?.presetId ?? null,
        },
      };

      const nextWorld = {
        ...world,
        behaviorRuntime: {
          ...behaviorRuntime,
          [entityId]: nextRuntime,
        },
        nodes: {
          ...(world.nodes || {}),
        },
      };

      // Apply overrides into canonical node truth (STRICT)
      const patch = filterBehaviorOverrides(targetState.propertyOverrides);
      applyNodePatch(nextWorld, entityId, patch);

      return nextWorld;
    }

    default:
      return world;
  }
}
