# UX Mode - Phase 6

Confirm Tier (Tier 2) - Planning Specification

Status: PLANNING ONLY
Depends on:

- Phase 3 - Semantics (LOCKED)
- Phase 4 - Awareness + Escalation Model (LOCKED)
- Phase 5 - Awareness + Warnings Implemented (LOCKED)

Activates: Tier 2 (Confirm)
Does NOT activate: Tier 3 (Block)

## 0. Phase 6 Mandate (Single Sentence)

Phase 6 introduces explicit, pre-execution user confirmation for Hard-Unsafe actions in UX Validation Mode, without changing dispatcher authority or introducing permanent restrictions.

## 1. What "Confirm" Means (Strict Definition)

Confirm is not permission.
Confirm is not warning.
Confirm is not block.

Confirm means:

- The system pauses once
- The user explicitly acknowledges intent
- Execution then proceeds normally

No confirmation means no execution.
Confirmation means execution unchanged.

## 2. Scope of Confirmation (Critical)

Confirmation applies only when all three are true:

- profile === "ux-validation"
- intent === "hard-unsafe"
- Enforcement tier === Tier 2

If any one is false, no confirmation.

## 3. Authority Model (Reaffirmed)

| Component | Role |
| --- | --- |
| WorkspaceRoot | Defines profile |
| Dispatcher | Sole execution authority |
| UI | Renders confirmation UI |
| UX Awareness | Signals intent only |

Dispatcher pauses execution pending confirmation, but still decides execution.

UI never executes.
UI never overrides.
UI never blocks independently.

## 4. Confirmation Flow (Canonical)

Sequence (Locked)

Action requested
-> Dispatcher observes intent
-> Dispatcher requests confirmation
-> UI presents confirm dialog
-> User confirms or cancels
-> Dispatcher proceeds or aborts

No alternative flows are allowed.

## 5. Confirmation UI Rules (Very Strict)

UI Type

- Modal dialog (this is the first allowed modal in UX Mode)
- Focus-trapping
- Keyboard accessible
- No background interaction

Copy (Canonical, Locked)

Title

"Confirm Structural Change"

Body

"This action performs a structural change while in UX Validation Mode."

Buttons

Primary: Confirm
Secondary: Cancel

- No scary language
- No warnings about damage
- No "are you sure?" phrasing

Neutral. Professional. Declarative.

## 6. Confirmation Memory (Session-Scoped)

To avoid fatigue:

Confirmation is remembered per action type per session

Example:

First NodeDelete -> confirm
Subsequent NodeDelete -> no confirm (same session only)

Rules:

- Memory is cleared on reload
- Memory is never persisted
- Memory never escalates privileges

## 7. Dispatcher Behavior (Planning Constraints)

Dispatcher must:

- Pause execution before mutation
- Resume only on explicit confirmation
- Abort cleanly on cancel (no side effects)

Dispatcher must NOT:

- Retry automatically
- Queue confirmations
- Batch confirmations
- Infer confirmation from past sessions

## 8. Failure and Cancellation Semantics

If user cancels:

- Action is not executed
- No partial state change
- Optional: emit a UX audit log entry (cancelled: true)

Cancel is not an error.
Cancel is intent reversal.

## 9. Relationship to Tier 3 (Block)

Phase 6 must not:

- Introduce permanent disallow lists
- Block silently
- Remove user choice

Tier 3 (Block) is:

- Separate
- Rarer
- Policy-driven
- Planned later

## 10. CI and Guardrails (Planned for Phase 6)

Phase 6 will require new CI rules, including:

- Confirmation dialogs allowed only for Hard-Unsafe + Tier 2
- No confirmations in Tier 1
- No confirmations outside UX Mode
- Dispatcher cancel paths must be side-effect-free
- Phase 5 guardrails must remain intact

## 11. Phase 6 Exit Criteria (Planning)

Phase 6 planning is complete when:

- Confirmation scope is locked
- UI copy is locked
- Dispatcher pause/resume model is defined
- Session-scoped memory rules are defined
- Tier 3 remains untouched

No code yet.

## 12. Canonical Phase 6 One-Liner

Phase 6 adds an explicit, session-scoped confirmation step for hard-unsafe actions in UX Validation Mode, pausing execution without altering authority or introducing permanent restrictions.

## Current System State

Phase 3: Semantics (LOCKED)
Phase 4: Awareness + escalation model (LOCKED)
Phase 5: Awareness + warnings implemented (LOCKED)
Phase 6: Planned (Confirm tier)
Phase 7: Not planned yet (Block)
