# Dropple OS — Authoring Tool Contracts
🔒 **Authoritative · Frozen · Read-Only**

This document defines the **non-negotiable contracts** governing all authoring tools in Dropple OS.

If a tool, feature, or UI violates this document, it is **invalid by definition** and must not be merged.

This file is intentionally strict. Convenience is secondary to correctness.

---

## 🔒 0. Status & Authority

- **Status:** 🔒 FROZEN
- **Scope:** All authoring tools (present and future)
- **Overrides:** Tool UX, previews, optimizations
- **Referenced by:** `docs/architecture.md`

Changing this document requires a **full architectural reset (Dropple v2)**.

---

## 🔒 1. Core Tool Philosophy (LOCKED)

> **Tools express intent.  
> Events express truth.  
> Reducers materialize truth.**

Tools do not change state.  
They **declare intent** and emit **explicit events**.

This principle is absolute.

---

## 🔒 2. Universal Tool → Event Pipeline (LOCKED)

All tools must obey this exact pipeline:

User Gesture
→ Tool Intent Model
→ Preview (illusion only, optional)
→ Explicit Events
→ Dispatcher (single gate)
→ Reducers (pure)
→ Runtime Truth

### Forbidden
- Skipping stages
- Reordering stages
- Writing truth during preview
- Emitting events outside the dispatcher

---

## 🔒 3. Global Tool Invariants (LOCKED)

All authoring tools must obey the following invariants.

### 🔒 3.1 Absolute Prohibitions

Tools must **never**:

- Call `setRuntimeState`
- Mutate Zustand stores directly
- Write to persistence
- Emit events from reducers
- Generate IDs internally
- Read preview state as truth
- Bypass the dispatcher
- Modify history directly

If it didn’t come from an event, it doesn’t exist.

---

### 🔒 3.2 Preview Is an Illusion

Preview systems:

- Write **only** to `useAnimatedRuntimeStore`
- Must be cancelable
- Must reset to truth on cancel
- Must not emit events
- Must not affect history, replay, or export

Preview must **never run** during:
- Replay
- Undo
- Redo
- Merge simulation

---

## 🧊 4. Tool Categories (STRUCTURE LOCKED)

All tools belong to **one category**.  
Categories may grow, but **may not blur**.

### Categories
1. Structural tools
2. State authoring tools
3. Animation relationship tools
4. Interaction routing tools
5. Timeline authoring tools
6. Preview tools
7. Dropple-only semantic tools

---

## 🔒 5. Structural Tools Contract (LOCKED)

Examples:
- Select
- Move
- Resize
- Reorder
- Auto-layout

### Contract
- Emit node/layout events only
- No animation
- No timeline awareness
- No state awareness

Structural tools operate on **static truth only**.

---

## 🔒 6. State Authoring Tools (LOCKED)

Examples:
- Define state identity
- Switch state identity
- Remove state identity

### Guarantees
- Emit only `STATE_SET` events
- No `STATE_CREATE` / `STATE_DELETE` events
- No implicit animation
- No automatic node value changes

State changes ≠ animation.

---

## 🔒 7. Animate Between States Tool (LOCKED)

### Purpose
Declare **how differences between states animate**.

### What It Is
- Declarative relationship authoring
- State-to-state animation metadata
- Not a timeline
- Not keyframes

### Tool Must
- Let user select:
  - source state
  - target state
  - properties
  - duration
  - easing
- Emit explicit animation declaration events

### Tool Must Never
- Generate keyframes
- Compute deltas
- Infer values
- Sample time
- Mutate nodes directly

---

## 🔒 8. Animation Reducer Invariants (LOCKED)

Animation reducers:

- Never compute animation
- Never infer missing data
- Never reorder keyframes
- Never generate IDs
- Never read runtime/UI/preview state
- Never sample time

Reducers **store truth only**.

Breaking this invalidates:
- Replay
- Merge
- Export
- Auditability

---

## 🔒 9. Interaction Tools (LOCKED)

Interactions define **when** something happens.

Examples:
- On click → switch state
- On hover → activate component

### Contract
- Store routing metadata only
- Emit `interaction/execute` control events
- Dispatcher translates into real events
- Reducers never execute interactions

Interactions route intent. They do not perform logic.

---

## 🔒 10. Preview Systems (LOCKED)

Applies to:
- Transition preview
- Animation preview
- Timeline scrubbing preview

### Guarantees
- Read-only evaluation
- Cancelable
- Isolated from truth
- Never recorded in history
- Never affects export

Preview is **ephemeral**.

---

## 🧊 11. Timeline Authoring Tools (CONTRACT-LOCKED)

### What Is Frozen
- Timeline is literal
- Keyframes are absolute
- No implicit animation
- No inferred easing or alignment

### What Can Evolve
- UI
- Editing ergonomics
- Authoring workflows

Truth rules are frozen. UX may evolve.

---

## 🧊 12. Dropple-Only Tools (EXTENSIBLE UNDER LAW)

Dropple may introduce unique tools, such as:
- Semantic motion ("enter", "exit")
- State morphing
- Motion constraints
- AI-assisted animation
- Lights & shadows
- Physics metaphors

### All Must
- Emit explicit events
- Respect reducer invariants
- Be replayable
- Be preview-only until commit

No tool gets special privilege.

---

## 🔒 13. Explicit Non-Goals (LOCKED)

Dropple tools will **never**:

- Guess user intent
- Auto-animate silently
- Hide generated truth
- Collapse preview into state
- Trade correctness for convenience

---

## 🔒 14. Lock Summary

| Area | Status |
|---|---|
| Core philosophy | 🔒 Frozen |
| Tool → event pipeline | 🔒 Frozen |
| Global invariants | 🔒 Frozen |
| Structural tools | 🔒 Frozen |
| State tools | 🔒 Frozen |
| Animate between states | 🔒 Frozen |
| Animation reducers | 🔒 Frozen |
| Interaction routing | 🔒 Frozen |
| Preview systems | 🔒 Frozen |
| Timeline UI | 🧊 Contract-locked |
| Dropple-only tools | 🧊 Extensible |

---

## 🔒 15. Final Statement

Dropple OS tools are **truth-respecting instruments**, not magic wands.

Every tool:
- Declares intent
- Produces explicit events
- Leaves an auditable trail
- Can be replayed years later

This document is **law**.

If a feature cannot obey it, that feature does not belong in Dropple OS.
