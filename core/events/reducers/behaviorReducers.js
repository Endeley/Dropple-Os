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
