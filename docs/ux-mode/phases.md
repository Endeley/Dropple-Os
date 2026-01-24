# UX Mode — Phases & Evolution

## Purpose

This document describes the **intentional evolution** of UX Mode across distinct phases.

UX Mode was not built as a single feature.
It was developed progressively to ensure clarity, reversibility, and architectural safety at every step.

Each phase is **additive** and **locked once complete**.

---

## Design Principle: Layer Before Power

UX Mode follows a strict rule:

> **Meaning comes before enforcement.**

The system must:
1. Know what actions mean
2. Communicate clearly
3. Ask for consent
4. Only then consider restriction

This principle governs every phase below.

---

## Phase 1 — Identity

**Goal:** Make UX Mode explicit and visible.

### Introduced
- Workspace profile flag (`ux-validation`)
- Visual UX badge
- Clear indication of operating mode

### Why This Phase Exists
Before changing behavior, the system must establish:
- Awareness of mode
- User trust
- Explicit context

No behavior changes were allowed in this phase.

**Status:** Complete and locked

---

## Phase 2 — Surface Signaling

**Goal:** Prevent accidental interaction through UI affordances.

### Introduced
- UI-only disabling of mutation controls
- Tooltips explaining why controls are disabled
- No runtime enforcement

### Why This Phase Exists
This phase:
- Reduced accidental mutations
- Set user expectations
- Avoided breaking execution paths

All disabling was **visual only**.

**Status:** Complete and locked

---

## Phase 3 — Semantics

**Goal:** Define what actions *mean*.

### Introduced
- Action intent taxonomy:
  - `safe`
  - `soft-unsafe`
  - `hard-unsafe`
- Formal UX Mode contract
- Shared vocabulary across system layers

### Why This Phase Exists
Without shared semantics:
- Enforcement becomes arbitrary
- UX Mode becomes inconsistent
- Future behavior cannot be reasoned about

This phase introduced **meaning**, not behavior.

**Status:** Locked (conceptual)

---

## Phase 4 — Awareness & Escalation Model

**Goal:** Make the system aware of UX intent without acting on it.

### Introduced
- Dispatcher awareness of UX Mode
- Observation of action intent
- Escalation tier model:
  - Tier 0 — Observe
  - Tier 1 — Warn
  - Tier 2 — Confirm
  - Tier 3 — Block (defined, not active)

### Why This Phase Exists
This phase separated:
- *Knowing* something is unsafe
- From *doing* something about it

It created a future-proof enforcement ladder.

**Status:** Locked (design)

---

## Phase 5 — Awareness + Warnings (Tier 0 / Tier 1)

**Goal:** Communicate unsafe actions clearly, without interference.

### Introduced
- Post-execution warnings
- Passive UX banner
- Session-scoped audit logging
- CI guardrails preventing escalation

### Why This Phase Exists
Users needed:
- Visibility into unsafe actions
- Confidence that nothing was silently blocked

This phase preserved full execution fidelity.

**Status:** Implemented and locked

---

## Phase 6 — Confirmation (Tier 2)

**Goal:** Require explicit consent for structural changes.

### Introduced
- Pre-execution confirmation for `hard-unsafe` actions
- Dispatcher-owned pause / resume flow
- Neutral, canonical confirmation UI
- Session-scoped confirmation memory

### Why This Phase Exists
This phase added:
- User agency
- Intent clarity
- Safety without restriction

Blocking was deliberately avoided.

**Status:** Implemented and locked

---

## Phase 7 — Blocking (Tier 3)

**Goal:** Enforce hard safety boundaries (optional).

### Defined (But Not Active)
- Dispatcher-level rejection of actions
- No user override
- Policy-driven activation

### Why This Phase Is Deferred
Blocking:
- Removes agency
- Requires strong policy justification
- Is difficult to roll back safely

Phase 7 exists as a **design possibility**, not a default.

**Status:** Not planned

---

## Locking & Guarantees

Once a phase is locked:
- Its semantics do not change
- Its guarantees remain valid
- Later phases must build on it, not bypass it

No phase may silently expand its scope.

---

## Summary

UX Mode evolved deliberately:

1. Identify the mode
2. Signal risk
3. Define meaning
4. Observe safely
5. Warn clearly
6. Ask for consent
7. Restrict only if absolutely necessary

This progression ensures UX Mode remains:
- Predictable
- Explainable
- Trustworthy
- Architecturally sound

Why This Doc Matters

This document:

Explains why UX Mode stopped at consent

Justifies the absence of blocking

Protects against “why not just add X?” questions

Makes future decisions defensible

It’s the historical spine of the system.
