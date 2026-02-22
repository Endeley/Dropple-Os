# CORE_ENGINE_FREEZE_V1

This document freezes the Dropple Engine Core v1 invariants.
It is enforcement-oriented and must not drift.

## 1. Determinism Contract

Given:
- Identical initial world
- Identical event sequence
- Identical workspace sequence

The engine must produce:
- Identical `world.nodes`
- Identical `world.behaviorRuntime`
- Identical `world.behaviors`
- Identical `world.timeline`
- Identical replay hash

Rules:
- No reducer may introduce nondeterminism.
- No reducer may read time (`Date.now`, `performance.now`).
- No reducer may depend on DOM or environment.
- No random UUIDs in canonical truth.

Checklist:
- [ ] Does this change introduce randomness?
- [ ] Does this change read `Date.now` or `performance.now`?
- [ ] Does this change depend on DOM?
- [ ] Does this change alter replay order?

## 2. Reducer Purity Contract

Reducers must:
- Be pure functions of `(world, event, ctx)`.
- Only mutate state inside `world`.
- Avoid reading external state.
- Avoid accessing workspace policy.
- Avoid async work.

All mutation flows through:
`applyEvent → rootReducer → commit`

No side channels.

## 3. Behavior Graph Schema v1

Frozen shape:
```
{
  baseStateId,
  states: [
    { id, label, propertyOverrides }
  ],
  transitions: [
    { id, fromStateId, toStateId, meta }
  ],
  triggers: [
    { id, triggerType, fromStateId, toStateId }
  ]
}
```

Validation:
- Strict schema enforcement.
- State existence enforced.
- Trigger references enforced.
- No legacy fields allowed.

## 4. Trigger Execution Model

Execution path:
`BEHAVIOR_TRIGGER_FIRE → resolveBehaviorTrigger() → BEHAVIOR_STATE_COMMIT → reducer`

Rules:
- Trigger resolution is pure.
- No direct state mutation.
- No bypassing dispatcher.
- Capability gating occurs before resolution.

Phase 1 only:
- No implicit transitions.
- No timing triggers.
- No guards.
- No nested states.

## 5. Capability Gating Rule

Workspace policy defines:
`enabledTriggerTypes: Set<string>`

Dispatcher guarantees:
- Unsupported trigger types are silently ignored.
- No reducer execution.
- No history entry.
- No replay drift.
- Mode switching is deterministic.

## 6. Timeline Contract

Frozen:
- Default timeline id is deterministic.
- No random IDs in canonical truth.
- Derived layout is not part of replay truth.

## 7. Explicit Non-Goals (v1)

Not included in v1:
- Hierarchical states
- Guard conditions
- Time-based triggers
- Async transitions
- Cross-entity triggers
- Implicit state changes

## ENGINE CHANGE CHECKLIST

Before merging:
- [ ] Replay determinism test passes
- [ ] `HASH A === HASH B`
- [ ] No reducer uses randomness
- [ ] No reducer reads time
- [ ] No direct state mutation outside reducer
- [ ] Workspace gating unaffected
