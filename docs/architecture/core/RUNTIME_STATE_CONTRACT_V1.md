# RUNTIME_STATE_CONTRACT_V1

Status: LOCK CANDIDATE  
Philosophy: Strict  
Scope: runtime/state/runtimeState.js and all runtime execution layers  

---

# 0. Foundational Principle

Dropple has one source of truth:

The Canonical Component Model (CCM).

Runtime state is NOT truth.

Runtime state is a deterministic, ephemeral execution projection of truth.

---

# 1. Definition

## 1.1 What runtimeState IS

runtimeState is:

- An ephemeral execution container
- A derived projection of canonical truth
- Reconstructable at any time from:
  - CCM
  - Event history
  - Timeline position
  - Active mode
- Used exclusively for:
  - Interaction responsiveness
  - Animation playback
  - Preview projection
  - Layout execution
  - Constraint resolution

runtimeState must never become canonical.

---

# 2. What runtimeState Is NOT

runtimeState is NOT:

- Persistent storage
- Canonical data
- Export source of truth
- Template source of truth
- Event history
- Reducer definition holder
- Timeline canonical storage

If runtimeState is deleted, the system must be recoverable.

---

# 3. Determinism Requirement

Given:

- Same CCM
- Same event log
- Same timeline cursor
- Same mode

runtimeState reconstruction must produce identical output.

No hidden randomness.
No implicit state.
No side-channel mutation.

---

# 4. Authority Model

runtimeState is mutation-controlled.

Mutation Authority Chain:

UI
→ Intent
→ Dispatcher
→ Reducers
→ runtimeState
→ Derived projection
→ Render

No other path is allowed.

---

# 5. Access Rules

## 5.1 Who MAY write to runtimeState

Only:

- runtime/dispatcher/dispatch.js
- runtime reducers
- internal runtime modules explicitly invoked by dispatcher

No UI file may write to runtimeState.

No selector may write to runtimeState.

No plugin may write to runtimeState directly.

---

## 5.2 Who MAY read runtimeState

Direct read access allowed only to:

- runtime internal modules
- runtime selectors

UI must read through:

runtime/selectors/*

Direct import of:

runtime/state/runtimeState.js

is forbidden outside runtime layer.

---

# 6. Selector Layer

All UI reads must go through pure selectors.

Selectors must:

- Be pure functions
- Never mutate
- Never dispatch
- Never call runtime modules
- Accept runtimeState as input
- Return derived view data

Selectors exist to decouple UI from mutation surface.

---

# 7. Preview & Evaluation Boundary

Evaluation modules may:

- Derive projections
- Compute animation states
- Compute constraint outputs

Evaluation modules may NOT:

- Mutate runtimeState
- Persist data
- Call dispatcher
- Modify canonical truth

Evaluation is pure computation.

---

# 8. Reducer Boundary

Reducers:

- Mutate runtimeState
- Are deterministic
- Operate only via dispatcher
- Never import UI
- Never import product
- Never import persistence

Reducers mutate execution container only.

---

# 9. Persistence Boundary

Persistence layer must never:

- Directly mutate runtimeState
- Depend on runtime internals

Persistence reconstructs canonical truth, not runtime state.

---

# 10. Lifecycle

runtimeState lifecycle:

1. Initialize from canonical truth
2. Apply events
3. Derive execution graph
4. Render
5. Destroyable at any time

System must survive runtimeState reset.

---

# 11. Hard Prohibitions

The following are illegal:

- UI importing runtimeState directly
- Truth modules importing runtime
- runtimeState importing UI
- runtimeState importing product
- runtimeState being serialized as canonical truth
- runtimeState being used as export source

Violations must fail build.

---

# 12. Invariants

- runtimeState must always reflect canonical truth
- runtimeState must not own authority
- runtimeState must not outlive its truth
- runtimeState must not contain canonical definitions

---

# 13. Architectural Implication

After this contract:

- UI becomes projection-only
- Dispatcher becomes sole mutation gateway
- Reducers become deterministic
- runtimeState becomes replaceable
- Debugging becomes time-travel safe
- Future realtime becomes feasible

---

# 14. Future Extensions (Not In V1)

- Runtime partitioning for multiplayer
- Snapshot diff optimization
- Execution sandboxing for plugins

Not included in V1.

---

# End of Contract
