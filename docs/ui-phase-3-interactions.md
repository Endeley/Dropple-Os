Phase 3 — Interaction Triggers
(How user actions cause state changes — safely)

Phase 3 Goal (Locked)

Introduce explicit, declarative interaction triggers that cause
STATE_SET and/or COMPONENT_SET_ACTIVE events —
without coupling UI, preview, or runtime heuristics to truth.

This phase answers one question only:
"What causes a state switch?"

---

What Phase 3 Is NOT

Phase 3 does not:
- add animation logic
- add preview logic
- add timeline logic
- infer intent from hover or selection
- allow UI to mutate state directly

All of that is forbidden.

---

Core Concept: Interaction ≠ Event

Interaction is:
- a declarative rule
- stored in document state
- replayable
- diffable
- mergeable

Event is:
- the execution of that rule

UI requests execution.
Dispatcher decides execution.

---

1) New Primitive: Interaction Definition

Location:
core/interactions/InteractionSchema.js

Minimal schema (Phase-3-safe):
export const InteractionTypes = {
  CLICK: 'click',
  HOVER: 'hover',
  KEY_PRESS: 'key_press',
};

export const InteractionActions = {
  SET_STATE: 'set_state',
  SET_COMPONENT_ACTIVE: 'set_component_active',
};

export function createInteraction({
  id,
  scope,              // 'component' | 'page'
  sourceId,           // componentId or pageId
  trigger,            // InteractionTypes
  action,             // InteractionActions
  targetStateId,      // for SET_STATE
  targetComponentId,  // optional
}) {
  return {
    id,
    scope,
    sourceId,
    trigger,
    action,
    targetStateId,
    targetComponentId,
  };
}

Notes:
- No callbacks
- No functions
- No timing
- No preview
- Pure data

---

2) Where Interactions Live in State

Add to runtime/document state:

interactions: {
  component: {
    [componentId]: InteractionDefinition[]
  },
  page: InteractionDefinition[]
}

They are metadata, like transitions.

---

3) Events Introduced (Minimal)

core/events/eventTypes.js

INTERACTION_CREATE: 'interaction/create',
INTERACTION_UPDATE: 'interaction/update',
INTERACTION_DELETE: 'interaction/delete',

Reducers:
- only mutate interaction metadata
- never execute interactions

---

4) Execution Model (Critical Separation)

Interaction execution is NOT a reducer.

Instead:

UI signal
  ↓
InteractionResolver (pure)
  ↓
Dispatcher emits STATE_SET / COMPONENT_SET_ACTIVE

This preserves:
- determinism
- replay safety
- undo correctness

---

5) Interaction Resolver (Key Component)

New file:
runtime/interactions/resolveInteraction.js

Responsibility:
Given:
- trigger (e.g. CLICK)
- source component ID
- current state

Decide:
- whether an interaction matches
- which event should be emitted

Pseudocode:
export function resolveInteraction({
  trigger,
  sourceId,
  runtimeState,
}) {
  const interactions =
    runtimeState.interactions.component[sourceId] || [];

  return interactions.find(i => i.trigger === trigger) || null;
}

---

6) Dispatcher Integration (Safe Path)

UI never dispatches STATE_SET directly.

Instead:
dispatch({
  type: 'interaction/execute',
  payload: { trigger, sourceId }
});

Dispatcher then:
- resolves interaction
- emits resulting event:
  - STATE_SET
  - COMPONENT_SET_ACTIVE

This keeps authority in the dispatcher.

---

7) UI Responsibilities (Strict)

UI may:
- detect clicks / hovers
- report (trigger, sourceId)
- render interaction editors

UI may NOT:
- decide state changes
- infer target state
- bypass dispatcher

---

8) Phase 3 UX (High-Level Only)

Component panel → "Interactions"

Add rule:
On Click → Go to State "Hovered"

No preview here
No animation here
No timeline

---

9) Safety Invariants (Must Hold)

- Interaction execution must be replayable
- Replaying events must re-execute interaction results identically
- Removing all interactions must not change behavior
- Interaction metadata must never affect layout/rendering directly

---

10) Phase 3 Verification Checklist

Before moving on:
- No UI dispatches STATE_SET directly
- All state changes come from dispatcher
- Interactions are pure data
- Resolver is pure
- Undo / redo works
- Replay works
- Preview still only triggers on identity change

---

Phase 3 Exit Condition

You may exit Phase 3 when:
A user can click a component and deterministically switch states
with no animation logic involved.

At that point:
- Transitions preview automatically (Phase 2)
- Interaction causes identity change (Phase 3)
- System remains clean

---

What Phase 4 Unlocks

Once Phase 3 is complete, Phase 4 becomes safe:
- Animation Mode
- timeline authoring
- motion curves
- multi-step animations
- exportable motion
