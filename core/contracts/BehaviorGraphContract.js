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

import crypto from 'crypto';

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

/**
 * Deep clone using structuredClone if available
 */
function deepClone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sort object keys recursively
 */
function sortObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        const value = obj[key];
        if (value !== undefined) {
          acc[key] = sortObjectKeys(value);
        }
        return acc;
      }, {});
  }

  return obj;
}

/**
 * Normalize propertyOverrides
 */
function normalizeOverrides(overrides) {
  if (!overrides) return {};
  return sortObjectKeys(overrides);
}

/**
 * Canonical graph normalization (pure)
 */
export function normalizeBehaviorGraph(graph) {
  const clone = deepClone(graph);

  clone.states = [...(clone.states ?? [])]
    .map((state) => ({
      ...state,
      propertyOverrides: normalizeOverrides(state.propertyOverrides),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  clone.transitions = [...(clone.transitions ?? [])].sort((a, b) =>
    (a.fromStateId + '→' + a.toStateId).localeCompare(
      b.fromStateId + '→' + b.toStateId
    )
  );

  clone.triggers = [...(clone.triggers ?? [])].sort((a, b) =>
    (a.triggerType + '|' + a.fromStateId + '|' + a.toStateId).localeCompare(
      b.triggerType + '|' + b.fromStateId + '|' + b.toStateId
    )
  );

  return clone;
}

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
  if (!graph) throw new Error('BehaviorGraph missing');

  const normalized = normalizeBehaviorGraph(graph);
  const stateIds = new Set();

  // ---- States ----
  if (!normalized.states || normalized.states.length === 0) {
    throw new Error('BehaviorGraph must have at least one state');
  }

  for (const state of normalized.states) {
    if (!state.id) throw new Error('State missing id');

    if (stateIds.has(state.id)) {
      throw new Error(`Duplicate state id: ${state.id}`);
    }

    stateIds.add(state.id);
  }

  if (!stateIds.has(normalized.baseStateId)) {
    throw new Error(`baseStateId does not exist: ${normalized.baseStateId}`);
  }

  // ---- Transitions ----
  const transitionSet = new Set();

  for (const t of normalized.transitions ?? []) {
    if (!stateIds.has(t.fromStateId)) {
      throw new Error(
        `Transition references invalid fromStateId: ${t.fromStateId}`
      );
    }

    if (!stateIds.has(t.toStateId)) {
      throw new Error(
        `Transition references invalid toStateId: ${t.toStateId}`
      );
    }

    const key = `${t.fromStateId}→${t.toStateId}`;
    if (transitionSet.has(key)) {
      throw new Error(`Duplicate transition: ${key}`);
    }

    transitionSet.add(key);
  }

  // ---- Triggers ----
  const triggerSet = new Set();

  for (const tr of normalized.triggers ?? []) {
    if (!tr.triggerType) throw new Error('Trigger missing triggerType');

    if (!stateIds.has(tr.fromStateId)) {
      throw new Error(
        `Trigger references invalid fromStateId: ${tr.fromStateId}`
      );
    }

    if (!stateIds.has(tr.toStateId)) {
      throw new Error(`Trigger references invalid toStateId: ${tr.toStateId}`);
    }

    const key = `${tr.triggerType}|${tr.fromStateId}|${tr.toStateId}`;
    if (triggerSet.has(key)) {
      throw new Error(`Duplicate trigger: ${key}`);
    }

    triggerSet.add(key);
  }

  return true;
}

export function hashBehaviorGraph(graph) {
  const normalized = normalizeBehaviorGraph(graph);

  const structural = {
    baseStateId: normalized.baseStateId,
    states: normalized.states,
    transitions: normalized.transitions,
    triggers: normalized.triggers,
  };

  const sorted = sortObjectKeys(structural);
  const json = JSON.stringify(sorted);

  return crypto.createHash('sha256').update(json).digest('hex');
}
