/**
 * CORE_BEHAVIOR_ENGINE_V1
 *
 * This contract defines the canonical structure for
 * structured interactive behavior inside Dropple.
 *
 * It is:
 * - Pure (no execution)
 * - Deterministic
 * - Domain-neutral
 * - Replay-safe
 *
 * No UI logic.
 * No reducer logic.
 * No preview logic.
 * No DOM access.
 *
 * This file defines data shape only.
 */

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

export const TRIGGER_TYPES = Object.freeze({
  POINTER: 'pointer',
  TIME: 'time',
  COMMAND: 'command',
  CONDITION: 'condition',
  SYSTEM: 'system',
});

/* -------------------------------------------------------------------------- */
/*                                   STATE                                    */
/* -------------------------------------------------------------------------- */

/**
 * A State represents a structured condition of an entity.
 *
 * - id must be deterministic
 * - propertyOverrides must be pure data
 * - domainMeta is optional and must not affect execution determinism
 */
export function createBehaviorState({
  id,
  label = '',
  propertyOverrides = {},
  domainMeta = {},
}) {
  if (!id) {
    throw new Error('BehaviorState requires an id');
  }

  return {
    id,
    label,
    propertyOverrides,
    domainMeta,
  };
}

/* -------------------------------------------------------------------------- */
/*                                TRANSITION                                  */
/* -------------------------------------------------------------------------- */

/**
 * A Transition describes how change occurs between two states.
 *
 * IMPORTANT:
 * - It does NOT execute.
 * - It does NOT mutate truth.
 * - It only describes meta for execution layer.
 */
export function createBehaviorTransition({
  id,
  fromStateId,
  toStateId,
  meta = {},
}) {
  if (!id) throw new Error('BehaviorTransition requires an id');
  if (!fromStateId) throw new Error('Transition requires fromStateId');
  if (!toStateId) throw new Error('Transition requires toStateId');

  return {
    id,
    fromStateId,
    toStateId,
    meta: {
      duration: meta.duration ?? 0,
      easing: meta.easing ?? 'linear',
      presetId: meta.presetId ?? null,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  TRIGGER                                   */
/* -------------------------------------------------------------------------- */

/**
 * A Trigger defines what may cause a state change.
 *
 * IMPORTANT:
 * - Triggers never execute directly.
 * - They must emit intent through dispatcher.
 * - Execution layer decides actual state mutation.
 */
export function createBehaviorTrigger({
  id,
  type,
  source = null,
  condition = null,
  targetStateId,
}) {
  if (!id) throw new Error('BehaviorTrigger requires an id');
  if (!type) throw new Error('BehaviorTrigger requires a type');
  if (!targetStateId)
    throw new Error('BehaviorTrigger requires targetStateId');

  if (!Object.values(TRIGGER_TYPES).includes(type)) {
    throw new Error(`Invalid trigger type: ${type}`);
  }

  return {
    id,
    type,
    source,
    condition,
    targetStateId,
  };
}

/* -------------------------------------------------------------------------- */
/*                              BEHAVIOR GRAPH                                */
/* -------------------------------------------------------------------------- */

/**
 * A BehaviorGraph attaches to an entity (node/component/page/etc.)
 *
 * It describes:
 * - Available states
 * - Transitions between states
 * - Triggers that can activate transitions
 *
 * It does NOT:
 * - Execute transitions
 * - Evaluate triggers
 * - Mutate canonical truth
 */
export function createBehaviorGraph({
  baseStateId,
  states = [],
  transitions = [],
  triggers = [],
}) {
  if (!baseStateId) {
    throw new Error('BehaviorGraph requires baseStateId');
  }

  return {
    baseStateId,
    states,
    transitions,
    triggers,
  };
}

/* -------------------------------------------------------------------------- */
/*                              INVARIANT CHECKS                              */
/* -------------------------------------------------------------------------- */

/**
 * Ensures graph integrity.
 * Must be safe to run during reducer validation.
 */
export function validateBehaviorGraph(graph) {
  if (!graph) return false;

  const stateIds = new Set(graph.states.map((s) => s.id));

  // Base state must exist
  if (!stateIds.has(graph.baseStateId)) {
    throw new Error('Base state does not exist in graph');
  }

  // All transitions must reference valid states
  for (const t of graph.transitions) {
    if (!stateIds.has(t.fromStateId)) {
      throw new Error(
        `Transition ${t.id} references invalid fromStateId`
      );
    }
    if (!stateIds.has(t.toStateId)) {
      throw new Error(
        `Transition ${t.id} references invalid toStateId`
      );
    }
  }

  if (Array.isArray(graph.triggers)) {
    for (const trigger of graph.triggers) {
      if (!trigger.id) {
        throw new Error('Trigger missing id');
      }

      if (!trigger.triggerType) {
        throw new Error(`Trigger ${trigger.id} missing triggerType`);
      }

      if (!trigger.fromStateId) {
        throw new Error(`Trigger ${trigger.id} missing fromStateId`);
      }

      if (!trigger.toStateId) {
        throw new Error(`Trigger ${trigger.id} missing toStateId`);
      }

      if (!stateIds.has(trigger.fromStateId)) {
        throw new Error(
          `Trigger ${trigger.id} references invalid fromStateId`
        );
      }

      if (!stateIds.has(trigger.toStateId)) {
        throw new Error(
          `Trigger ${trigger.id} references invalid toStateId`
        );
      }
    }
  }

  return true;
}
