# UX Mode - Phase 4 (Locked)

Dispatcher Awareness Specification (Planning Only)

Status: PLANNING
Depends on: Phase 3 (LOCKED)
Implements: Awareness, not enforcement

## Lock Declaration

Phase 4 (Awareness, Warnings, Escalation Rules) is now frozen.

Locked Artifacts

- Dispatcher Awareness Layer (DAL) - observe only
- UX Warning language (canonical copy + tone)
- Warning surfaces + timing rules
- Enforcement tier ladder (Tier 0-3)
- Escalation matrix
- Rollback guarantees
- Explicit prohibitions

Permanently Forbidden in Phase 4

- Blocking execution
- Confirmation dialogs
- Dispatcher authority changes
- CCM mutation
- UI-based enforcement
- Silent behavior changes

Phase 4 knows but does not act.

This phase will never be reopened - only referenced by future phases.

## Phase 4 Canonical Summary (Source of Truth)

Phase 4 introduces Dispatcher-level awareness of UX Mode and action intent, emits structured warnings through approved surfaces, and defines a future enforcement ladder. Execution behavior remains unchanged, and only Tier 0 (Observe) is active.

## 0. Phase 4 Mandate (Single Sentence)

Phase 4 makes the Dispatcher aware of UX intent and workspace profile, without changing execution outcomes.

If an action succeeds today, it must still succeed after Phase 4.

## 1. Authority Boundary (Reaffirmed)

Before anything else, authority is re-stated and locked:

WorkspaceRoot

- Sole source of truth for profile

Dispatcher

- Sole executor of mutations
- Becomes UX-aware, not UX-controlling

UI / Canvas / CCM

- Signal only
- No enforcement
- No independent inference

Phase 4 adds perception, not power.

## 2. New Concept: Dispatcher Awareness Layer

Phase 4 introduces a conceptual layer inside the Dispatcher:

Dispatcher Awareness Layer (DAL)

This is not a new system, only a mental and architectural layer.

Responsibilities:

- Receive UX profile context
- Receive action intent classification
- Attach semantic meaning to actions before execution
- Emit signals (logs, warnings, hooks)

Non-responsibilities:

- Blocking
- Rewriting actions
- Mutating payloads
- Altering execution order

## 3. Inputs to Dispatcher (Conceptual)

In Phase 4 planning, the Dispatcher becomes aware of three signals.

### 3.1 Workspace Profile

Provided by WorkspaceRoot:

profile: "design" | "ux-validation" | ...

Rules:

- Read-only
- Immutable per session
- Never inferred

### 3.2 Action Descriptor

Every dispatched action is described, not modified.

Conceptual shape:

{
  actionType: string,
  payload: unknown
}

No changes required in Phase 4.

### 3.3 UX Intent (From Phase 3 Vocabulary)

Mapped conceptually:

intent: "safe" | "soft-unsafe" | "hard-unsafe"

Important:

- This may initially be inferred by a lookup table
- Not required to be embedded in action payloads yet
- Not required to exist in code yet

## 4. Awareness Decision Matrix

Before execution, the Dispatcher observes:

| Profile | Intent | Dispatcher Reaction (Phase 4) |
| --- | --- | --- |
| design | any | Execute normally |
| ux-validation | safe | Execute silently |
| ux-validation | soft-unsafe | Execute + mark |
| ux-validation | hard-unsafe | Execute + warn |

Execute always happens.
Only side effects differ.

## 5. Side Effects (Allowed in Phase 4)

Phase 4 allows only observational side effects.

### 5.1 Logging

Examples:

- Dev console warnings
- Structured logs
- Session audit trails

Example (conceptual):

[UX MODE] Hard-Unsafe action executed: NodeDelete

### 5.2 Signaling Hooks (Future-Proof)

Dispatcher may emit signals like:

onUXIntentObserved({
  profile,
  intent,
  actionType
})

Rules:

- No consumer is required
- No consumer may block
- Signals may be ignored

## 6. Explicit Prohibitions (Critical)

Phase 4 must not:

- Throw errors
- Prevent execution
- Modify payloads
- Auto-confirm actions
- Add modal dialogs
- Require user input
- Add retries or rollbacks

If anything blocks execution, Phase 4 is violated.

## 7. Failure Philosophy

If UX intent metadata is:

Missing -> default to hard-unsafe
Unknown -> log warning, continue
Misclassified -> execution still proceeds

Safety through visibility, not restriction.

## 8. Relationship to Future Phases

Phase 4 enables but does not activate:

- Phase 5: Confirmations
- Phase 6: Soft blocking
- Phase 7: Hard enforcement

Each future phase:

- Builds on the same awareness signals
- Requires explicit opt-in
- Can be rolled back independently

## 9. Phase 4 Exit Criteria (Planning)

Phase 4 planning is considered complete when:

- Dispatcher Awareness Layer is defined
- Input signals are specified
- Decision matrix is locked
- Side effects are constrained
- Prohibitions are explicit

No code required.

## 10. One-Line Canonical Summary (Phase 4)

Phase 4 introduces Dispatcher-level awareness of UX Mode and action intent, enabling structured observation and signaling without altering execution behavior.

## State Check

Phase 3: LOCKED
Phase 4: PLANNED (awareness only)
Enforcement: Not yet
