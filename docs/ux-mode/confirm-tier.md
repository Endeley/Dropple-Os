# UX Mode — Confirm Tier (Tier 2)

## Purpose

This document defines the **Confirm tier (Tier 2)** of UX Mode.

The Confirm tier introduces an explicit, pre-execution confirmation step for
**structural actions**, ensuring that users intentionally consent to impactful
changes during UX validation.

Confirm is about **clarity and consent**, not restriction.

---

## What Confirm Is

Confirm is a **single, explicit pause** before execution that requires
user acknowledgement.

Confirm:
- Pauses execution
- Explains intent
- Awaits a user decision
- Proceeds unchanged on confirmation
- Aborts cleanly on cancellation

Confirm does **not**:
- Block permanently
- Escalate automatically
- Reduce user capability
- Enforce policy

---

## Scope of Confirm (Triple-Gate Rule)

Confirmation is required **only** when all three conditions are met:

1. Workspace profile is `ux-validation`
2. Action intent is `hard-unsafe`
3. Active enforcement tier is **Tier 2**

If **any** condition is false, confirmation must not occur.

---

## Authority Model

Confirm preserves the core authority contract:

- **Dispatcher** owns execution and pause/resume
- **UI** renders the confirmation dialog
- **WorkspaceRoot** defines context
- **UX awareness layers** classify intent only

The UI never decides execution.
The Dispatcher never delegates authority.

---

## Confirmation Flow (Locked)

The following sequence is canonical:



Action requested
→ Dispatcher evaluates intent and tier
→ Dispatcher pauses execution
→ UI presents confirmation dialog
→ User confirms or cancels
→ Dispatcher resumes or aborts


No alternate flows are allowed.

---

## Confirmation UI Contract (Canonical)

### Dialog Type
- Modal
- Focus-trapped
- Keyboard accessible
- No background interaction

### Copy (Locked Verbatim)

**Title**
> Confirm Structural Change

**Body**
> This action performs a structural change while in UX Validation Mode.

**Actions**
- Primary: Confirm
- Secondary: Cancel

No additional copy, warnings, or styling is permitted.

---

## Cancel Semantics

Cancel is a **neutral outcome**.

On cancel:
- Execution does not occur
- No state is mutated
- No errors are thrown
- No escalation occurs

Cancel must not be treated as failure, misuse, or violation.

---

## Confirmation Memory

To reduce fatigue:

- Confirmation is remembered **per action type**
- Memory is **session-scoped**
- Memory is cleared on reload
- Memory does not persist
- Memory does not grant permission

Memory exists solely to avoid repetitive confirmations.

---

## Interaction with Other Tiers

- Tier 0 (Observe): No confirmation
- Tier 1 (Warn): No confirmation
- Tier 2 (Confirm): This document applies
- Tier 3 (Block): Not covered here

Confirm must not:
- Behave like Block
- Anticipate Tier 3
- Simulate policy enforcement

---

## Prohibited Behaviors

The following are strictly forbidden in Tier 2:

- Confirming `safe` actions
- Confirming `soft-unsafe` actions
- Confirmation outside UX Mode
- Auto-confirmation based on history
- Time-based cancellation
- Queued confirmations
- Using confirmation outcomes for policy

Any of the above invalidates the Confirm tier.

---

## Guarantees

Tier 2 guarantees:

- Explicit user consent for structural changes
- No silent behavior changes
- Full reversibility
- Preservation of dispatcher authority

---

## Summary

The Confirm tier exists to ask a single, clear question:

> “Do you intend to make this structural change while validating UX?”

Nothing more. Nothing less.

If Confirm ever feels restrictive, it has been misused.

Why This Document Matters

This doc:

Prevents “confirmation creep”

Locks canonical copy

Preserves cancel neutrality

Keeps Tier 2 from becoming Tier 3

Makes consent the final UX safeguard

At this point, UX Mode’s core contract is complete.
