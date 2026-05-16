# Dropple Architecture Laws

## 1. UI Boundary
UI modules may:
- emit input
- render projections

UI modules may NOT:
- import runtime implementation
- mutate runtime state
- compute interaction logic

## 2. Dispatcher Authority
All mutations must go through dispatcher.

Forbidden:
- direct state mutation
- reducer bypass

## 3. Runtime Ownership
Runtime owns:
- interaction math
- drag
- snap
- magnetic
- constraints

## 4. Engine Purity
Engines must be pure functions:

`(input, state) -> output`

Forbidden:
- DOM access
- React hooks
- randomness
- time-based logic

## 5. Tool System Contract
Tools must:
- register through capability lifecycle
- use dispatcher events

Forbidden:
- custom workspace logic paths
- direct mutation

## 6. Event-Driven Truth
All interaction effects must resolve to events:
- `node.layout.bulk` (canonical)
- `node.layout.move` (deprecated, compatibility only)
- `node.layout.resize`
- `node.layout.rotate`

## 7. Single Interaction Pipeline
All interaction flows through:

`Input -> Tool -> Drag -> Resolve -> Magnetic -> Reducer -> Projection -> UI`

## 8. No Temporary Authority
Every implementation, optimization, and upgrade must use the final lawful authority model.

Forbidden:
- temporary authority paths
- compatibility orchestration inside canonical runtime systems
- dual authority systems
- shadow execution semantics
- UI-side emergency orchestration

If the lawful ownership, deterministic execution, and canonical orchestration model are not ready yet, the feature waits.

## 9. Execution Provenance
Execution provenance must be deterministic, immutable, reconstructible, and replay-safe.

Execution identity may not depend on:
- machine order
- worker timing
- queue timing
- retry timing
- thread scheduling
- transport order
- execution locality

Resumed execution and uninterrupted execution must preserve canonical execution identity.

Coordination systems may not mutate manifest truth, session truth, or authored runtime truth.

## 10. Interpreted Tool Non-Sovereignty
Interpreted tools may express intent but may not own authority.

Forbidden:
- direct dispatcher internals
- reducer internals
- runtime state setters
- tool-registration mutation paths
- direct runtime truth mutation
- recursive tool-owned authority synthesis

Tool synthesis must remain capability-bounded, dispatcher-owned, and replay-safe.

## 11. Semantic Projection Governance
Many synthesized owners may converge on one visible tool id.

That visible id may expose only one canonical projected meaning at a time.
That projected meaning may map to only one canonical execution contract at a time.

Equivalent ownership topologies must produce equivalent semantic projection.

winner-owned fields:
- `label`
- `defaultActive`

mergeable fields:
- `intentTopics`
- `capabilityTags`

invalid conflict fields:
- `handlerFamily`
- `handlerPayload`
- `executionSignature`
- `group`

Execution signatures are versioned.
Minor-version differences are allowed only when core execution semantics are identical.
Major-version differences are invalid for one projected identity.
Major-version compatibility is lawful only via explicit tool-id migration windows.
Migration windows must stay deterministic, bounded, and non-authoritative.

Invalid shared identities must not project into runtime-visible tool state.

## 12. Scheduler Identity
Schedule identity is canonical runtime authority:
- deterministic partition identity
- deterministic ordering
- canonical schedule signatures
- deterministic checkpoint legality
- deterministic resume/budget semantics

All schedule hashing + checkpoint legality checks must route through one runtime scheduler identity module.

If resume legality cannot be proven, execution must fail closed.
