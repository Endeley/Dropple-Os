# UX Mode — Intent & Escalation

## Purpose

This document defines the **semantic intent model** and the **enforcement escalation ladder** used by UX Mode.

It answers two foundational questions:
1. What does an action *mean*?
2. How does the system *respond* to that meaning?

Intent and escalation are defined separately so that meaning never changes silently when behavior does.

---

## Core Principle

> **Meaning is stable. Enforcement is optional.**

Action intent is intrinsic and does not change based on:
- User
- Environment
- Frequency
- History
- Enforcement tier

Escalation responds to intent — it does not redefine it.

---

## Action Intent Taxonomy (Locked)

Every action in Dropple is classified into exactly one intent category.

### `safe`

**Definition**
Actions that cannot cause structural, persistent, or irreversible changes.

**Characteristics**
- No data loss
- No graph mutation
- No schema impact
- No persistence beyond view/session

**Examples**
- Canvas pan / zoom
- Selection
- Hover inspection
- Read-only previews
- Timeline scrubbing
- Interaction / execution triggers

**Guarantee**
Safe actions must **never** be blocked, warned, or confirmed.

---

### `soft-unsafe`

**Definition**
Actions that modify state but are reversible, scoped, or non-structural.

**Characteristics**
- State change is limited
- Changes can be undone or reset
- No permanent structural impact

**Examples**
- Local UI preferences
- Temporary layout adjustments
- View filters
- Non-persistent toggles

**Guarantee**
Soft-unsafe actions:
- May be observed or warned
- Must never require confirmation
- Must never be blocked

---

### `hard-unsafe`

**Definition**
Actions that perform structural, persistent, or potentially destructive changes.

**Characteristics**
- Mutates graphs or core data
- May cause irreversible effects
- Alters system structure

**Examples**
- Node creation or deletion
- Graph rewiring
- Structural mutations
- CCM-related mutations

**Guarantee**
Hard-unsafe actions:
- Must be visible to the system
- May require explicit confirmation
- Are the only actions eligible for blocking (Tier 3)

---

## Escalation Tiers (Locked Ladder)

Escalation tiers define **how the system responds** to intent.

| Tier | Name | Behavior |
|---|---|---|
| Tier 0 | Observe | Observe intent only |
| Tier 1 | Warn | Post-execution warning |
| Tier 2 | Confirm | Pre-execution confirmation |
| Tier 3 | Block | Execution rejected |

Each tier is **opt-in**, explicit, and phase-gated.

---

## Canonical Escalation Matrix (Immutable)

| Intent | Tier 0 | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|---|
| safe | Execute | Execute | Execute | Execute |
| soft-unsafe | Execute | Warn | Execute | Execute |
| hard-unsafe | Execute | Warn | Confirm | Block |

No deviation from this matrix is allowed.

---

## Non-Negotiable Rules

The following rules are absolute:

- `safe` actions are never gated
- `soft-unsafe` actions are never confirmed
- Only `hard-unsafe` actions may be confirmed
- Blocking applies only at Tier 3
- Escalation tiers never auto-advance
- Intent classification never changes dynamically

Violating any of these breaks UX Mode.

---

## Intent Classification Source of Truth

Intent classification:
- Is defined centrally
- Is static
- Defaults to `hard-unsafe` if unknown

Intent must never be:
- Inferred by UI
- Passed in action payloads
- Mutated at runtime
- Overridden ad hoc

---

## Why Intent Is Separate from Enforcement

Separating intent from enforcement ensures:
- Predictability
- Auditability
- Safe evolution
- Rollback capability

Enforcement can change.
Meaning must not.

---

## Summary

- Intent defines *what an action is*
- Escalation defines *how the system responds*
- The two are deliberately decoupled
- The escalation matrix is immutable

UX Mode remains safe and understandable because meaning never drifts.

Why This Doc Is Crucial

This document:

Prevents “just confirm this too” creep

Protects safe actions permanently

Locks the escalation ladder

Makes CI guardrails logically grounded

With this in place, UX Mode semantics are complete.
