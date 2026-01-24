# UX Mode — Authority Model

## Purpose

This document defines **who is allowed to decide what** in UX Mode.

Its purpose is to preserve a single, stable execution authority and prevent
decision-making from drifting across UI, validation, or tooling layers.

If this contract is violated, UX Mode is considered **broken**, regardless of
whether the system “appears to work”.

---

## Core Authority Principle

> **There is exactly one execution authority in Dropple: the Dispatcher.**

No other component may:
- Execute actions
- Block actions
- Delay actions
- Conditionally allow actions
- Infer execution permissions

UX Mode does not change this principle.

---

## Authority Roles (Canonical)

### WorkspaceRoot — Context Authority

**Responsibilities**
- Defines the active workspace profile (e.g. `ux-validation`)
- Supplies context to downstream systems
- Acts as the single source of truth for workspace mode

**Constraints**
- WorkspaceRoot never enforces behavior
- WorkspaceRoot never blocks actions
- WorkspaceRoot never mutates execution logic

WorkspaceRoot **describes context**.
It does not decide outcomes.

---

### Dispatcher — Execution Authority

**Responsibilities**
- Receives all action requests
- Executes mutations
- Applies validation and sequencing
- Owns pause / resume semantics (Phase 6+)

**In UX Mode**
- Dispatcher may observe action intent
- Dispatcher may emit warnings
- Dispatcher may request explicit confirmation
- Dispatcher decides whether execution proceeds

**Constraints**
- Dispatcher authority must remain singular
- Dispatcher must not delegate execution decisions
- Dispatcher must not infer intent from UI state

If the Dispatcher does not execute an action, **no other component may**.

---

### UI Layer — Rendering Authority Only

**Responsibilities**
- Render controls
- Display warnings and explanations
- Present confirmation dialogs when instructed
- Collect explicit user responses

**Constraints**
- UI must never execute actions
- UI must never block actions
- UI must never infer safety or intent
- UI must never decide whether an action is allowed

In UX Mode, the UI may **ask the user** —
but only the Dispatcher may **act on the answer**.

---

### UX Awareness & Safety Layers — Observational Only

**Responsibilities**
- Classify action intent (safe / unsafe)
- Emit warnings and signals
- Provide semantic metadata to the Dispatcher

**Constraints**
- Must not mutate state
- Must not throw errors
- Must not alter execution paths
- Must not enforce policy

These layers exist to **inform**, not to decide.

---

## Explicitly Forbidden Authority Patterns

The following patterns are **never allowed**, even if they appear convenient:

- UI-based enforcement (“disable + block”)
- Modal dialogs that execute or cancel actions directly
- Validation layers that silently prevent execution
- Action payloads carrying permission or intent flags
- Logs or audit trails influencing runtime decisions
- Automatic escalation based on frequency or history

Any of the above constitutes **authority drift**.

---

## Why Authority Must Be Singular

Splitting authority causes:
- Inconsistent behavior
- Hidden side effects
- Untraceable bugs
- Broken mental models for users
- Impossible-to-audit systems

UX Mode exists to **clarify behavior**, not fragment it.

Singular authority ensures:
- Predictability
- Debuggability
- Reversibility
- Trust

---

## Enforcement of This Model

This authority model is enforced by:
- Architectural design
- CI guardrails
- Phase locking
- Code review discipline

Violations must be corrected immediately, even if they appear harmless.

---

## Summary

- **WorkspaceRoot defines context**
- **Dispatcher executes**
- **UI renders and asks**
- **UX Mode observes and explains**

No other interpretation is valid.

This authority model is foundational and must not be weakened.

Why This Doc Is Critical

This document:

Prevents “helpful” UI shortcuts

Stops future policy creep

Makes CI guardrails intelligible

Gives reviewers a hard reference point

Protects Dropple’s core architecture long-term

It is effectively your constitutional law.
