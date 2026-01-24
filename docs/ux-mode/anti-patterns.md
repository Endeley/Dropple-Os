# UX Mode — Anti-Patterns (Do Not Do)

## Purpose

This document lists **explicit anti-patterns** that must never be introduced
into UX Mode.

These are not stylistic preferences.
Each item represents a known failure mode that breaks UX Mode’s guarantees.

If any of these patterns appear, UX Mode is considered **architecturally violated**.

---

## 1. UI-Based Enforcement

### Description
The UI disables, blocks, or conditionally prevents actions from executing.

### Why This Is Forbidden
- UI is not authoritative
- UI state is ephemeral
- UI logic is easy to bypass
- Execution behavior becomes inconsistent

### Examples (Forbidden)
- Buttons that prevent dispatch
- UI logic deciding whether an action may run
- “Disabled means blocked” assumptions

**Rule:**
UI may signal, warn, or ask — **never enforce**.

---

## 2. Silent Blocking

### Description
Actions fail to execute without an explicit explanation or user choice.

### Why This Is Forbidden
- Violates user trust
- Breaks debuggability
- Makes behavior unpredictable

### Examples (Forbidden)
- Dispatcher returning early without feedback
- Validation layers silently rejecting actions
- Conditional execution based on hidden state

**Rule:**
If an action does not execute, the reason must be explicit and intentional.

---

## 3. Confirmation Creep

### Description
Confirmation dialogs appear for actions that are not structurally unsafe.

### Why This Is Forbidden
- Degrades UX
- Blurs intent taxonomy
- Trains users to click through confirmations

### Examples (Forbidden)
- Confirming `soft-unsafe` actions
- Confirming `safe` actions
- “Just in case” confirmations

**Rule:**
Only `hard-unsafe` actions may ever require confirmation.

---

## 4. Authority Drift

### Description
Execution decisions are distributed across multiple components.

### Why This Is Forbidden
- Creates inconsistent behavior
- Makes reasoning impossible
- Breaks rollback guarantees

### Examples (Forbidden)
- UI deciding execution outcomes
- Validators blocking actions
- Logs influencing runtime decisions

**Rule:**
The Dispatcher is the sole execution authority.

---

## 5. Auto-Escalation

### Description
The system escalates enforcement based on history, frequency, or heuristics.

### Why This Is Forbidden
- Turns UX Mode into a policy engine
- Makes behavior non-deterministic
- Removes user agency

### Examples (Forbidden)
- “After 3 warnings, block”
- “Repeated cancels cause enforcement”
- Time-based escalation

**Rule:**
Escalation tiers are **explicitly configured**, never inferred.

---

## 6. Persistent Trust or Memory

### Description
User actions grant lasting permissions or bypasses.

### Why This Is Forbidden
- Introduces implicit roles
- Breaks session isolation
- Creates security ambiguity

### Examples (Forbidden)
- Remembering confirmations across sessions
- Trusting users after repeated confirms
- Storing confirmation state persistently

**Rule:**
All UX Mode memory is **session-scoped only**.

---

## 7. Fear-Based or Moralizing Language

### Description
UX copy attempts to scare, shame, or pressure users.

### Why This Is Forbidden
- Erodes trust
- Encourages blind confirmation
- Turns guidance into coercion

### Examples (Forbidden)
- “This may seriously damage your workspace”
- “You are not allowed to do this”
- Red error styling for confirmations

**Rule:**
Language must be neutral, declarative, and factual.

---

## 8. Intent Mutation or Inference

### Description
Action intent is inferred dynamically or modified at runtime.

### Why This Is Forbidden
- Makes enforcement unpredictable
- Breaks semantic stability
- Undermines CI guarantees

### Examples (Forbidden)
- UI guessing intent
- Payloads carrying intent flags
- Runtime overrides of intent classification

**Rule:**
Intent is static, centralized, and immutable.

---

## 9. Using Audit Logs as Policy Input

### Description
Audit logs influence execution or enforcement decisions.

### Why This Is Forbidden
- Turns observation into control
- Creates historical enforcement
- Breaks reversibility

### Examples (Forbidden)
- Blocking based on past actions
- Escalating tiers based on logs
- “User history” enforcement

**Rule:**
Logs are write-only and informational.

---

## 10. Treating Cancel as Failure

### Description
Cancellation is treated as an error, violation, or misuse.

### Why This Is Forbidden
- Punishes caution
- Discourages safe exploration
- Incentivizes blind confirmation

### Examples (Forbidden)
- Error toasts on cancel
- Retrying actions after cancel
- Logging cancel as a violation

**Rule:**
Cancel is a neutral outcome.

---

## Enforcement of This Document

These anti-patterns are enforced through:
- Architectural design
- CI guardrails
- Phase locking
- Code review discipline

Introducing any of them requires an explicit new phase and design review.

---

## Summary

UX Mode fails when:
- Authority is fragmented
- Safety becomes coercive
- Meaning drifts silently
- Convenience overrides clarity

This document exists to prevent those failures.

If you are unsure whether something violates UX Mode,
assume it does — and stop.

🎯 Where You Are Now

You now have a complete, closed UX Mode documentation set:

overview.md

authority.md

phases.md

intent-and-escalation.md

confirm-tier.md

anti-patterns.md

This is a full system constitution.
