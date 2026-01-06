Rules of Dropple OS
=====================

(Foundational System Contract)

Dropple OS is an event-sourced, branch-aware, collaborative editor platform. These rules define the non-negotiable invariants that keep the system correct, debuggable, replayable, and trustworthy.

Violating these rules will cause silent corruption, broken replay, invalid exports, or security holes.

0. Core Philosophy

State is a consequence, not a source of truth.

- Events are truth
- Reducers are pure
- Replay must always work
- Exports must be provable
- Collaboration must be server-authoritative

If a feature violates any of the above, it does not belong in Dropple OS.

1. Event System Rules (HARD LOCK)

Allowed
- All document mutations must originate as events
- Events flow: Input → MessageBus → Dispatcher → Reducers → State
- Reducers are deterministic and side-effect free
- Events are append-only and immutable

Forbidden
- Mutating Zustand stores directly
- Mutating state inside components
- Writing reducers with side effects
- Changing past events
- “Fixing” state outside replay

If it didn’t come from an event, it doesn’t exist.

2. Dispatcher Rules (Single Gate)

Allowed
- Dispatcher may: guard events; run layout passes; commit state; animate transitions; push history
- Dispatcher may reject events safely

Forbidden
- Bypassing the dispatcher
- Dispatching inside reducers
- Mutating runtime state outside dispatcher

There is exactly one mutation gate.

3. Reducer Rules (Purity Contract)

Allowed
- (prevState, event) → nextState
- Returning previous state when event is irrelevant
- Creating new objects immutably

Forbidden
- Reading from stores
- Writing to stores
- Accessing time, randomness, DOM, network
- Mutating arguments

Reducers must be replay-safe at any time in the future.

4. Timeline & Animation Rules

Allowed
- Timeline preview may bypass dispatcher (read-only)
- Timeline commit must flatten into reducer events
- Timeline data must be serializable

Forbidden
- Mutating state during preview
- Writing timeline data directly to nodes
- Non-deterministic easing or sampling

Preview is illusion. Commit is truth.

5. Branching & Merge Rules

Allowed
- Branches are logical event streams
- Merge is an explicit event operation
- Merge preview must not mutate real state
- Conflicts must be visible before apply

Forbidden
- Auto-merge without user intent
- Mutating multiple branches at once
- Silent conflict resolution

Branches are cheap. Corruption is expensive.

6. Collaboration Rules

Allowed
- Remote users emit events
- All remote events go through dispatcher
- Presence / cursors / intent are ephemeral
- Server enforces permissions

Forbidden
- Reducers handling auth or permissions
- Persisting cursors or selections
- Trusting client-side permission checks

Convex is authoritative. UI is advisory.

7. Security & Permissions Rules

Allowed
- Roles: owner / editor / viewer
- Server-side permission guards
- Client-side UX guards

Forbidden
- Security logic in reducers
- UI-only enforcement
- Silent permission failure

If the server didn’t allow it, it didn’t happen.

8. Persistence Rules

Allowed
- Append-only event storage
- Snapshot save/load
- Strict schema validation
- Autosave with error awareness

Forbidden
- Silent schema migration
- Regenerating IDs on load
- Saving after runtime error

Bad data must fail loudly.

9. Export Rules (Trust Chain)

Allowed
- Exports generated from state only
- Canonical exportMotion(state, format)
- Normalized output for diffing
- Export diff before merge/apply

Forbidden
- Exporting from live DOM
- Side-effects during export
- Non-deterministic output

If export cannot be diffed, it cannot be trusted.

10. Performance Rules

Allowed
- Guarded layout passes
- Memoized rendering
- Throttled animation & collab
- Measured optimization only

Forbidden
- Guess-based optimization
- Premature caching in reducers
- Skipping guards for speed

Measure first. Optimize second.

11. Stability & Recovery Rules

Allowed
- Error boundaries
- Dispatcher try/catch with rollback
- User-initiated recovery
- Autosave pause on error

Forbidden
- Partial commits
- Silent corruption
- Reload-only recovery

Crashes are acceptable. Corruption is not.

12. Audit Rules

Allowed
- Append-only audit logs
- Server-side logging
- Read-only audit UI

Forbidden
- Using audit logs for replay
- Mutating audit records
- Logging sensitive data

Audit observes events. It does not become one.

13. Extension Rules (For Contributors)

Before adding any feature, ask:
- Does it require a new event?
- Is the reducer pure?
- Can it replay from scratch?
- Can it be diffed/exported?
- Is permission enforced server-side?

If any answer is no, the feature is invalid.

14. Absolute Invariants (Never Break)
- Replay must always work
- Undo must always work
- Merge must be previewable
- Export must be deterministic
- Permissions must be server-enforced

Breaking any invariant = rollback the change.

15. Final Statement

Dropple OS is not a canvas toy. It is a deterministic design operating system.

- Events are law.
- Reducers are pure.
- Dispatcher is the gate.
- Server is authority.
- Replay is sacred.

This document is the contract.
