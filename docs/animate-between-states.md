# Phase 7 — Animate Between States UX

Status: Normative / Enforceable
Depends on: Phase 6 Tool UX (locked)
Scope: Motion semantics only (no visuals, no libraries, no new systems)

---

## 1. Purpose

Phase 7 defines how state changes feel, not how they look.

Animation in Dropple is not decoration.
It exists to:

- Explain causality
- Preserve spatial memory
- Prevent cognitive discontinuity
- Reinforce single brain / single canvas / single timeline

Animation must never introduce meaning. It may only reveal meaning that
already exists.

---

## 2. Hard Constraints

The following are non-negotiable:

- No new animation systems
- No timeline-based choreography engines
- No onboarding or instructional animation
- No delight-only motion
- No animation longer than 150ms
- No animation that blocks interaction

If animation is removed entirely, the UX must still be correct.

---

## 3. Core Principle: State Change Must Be Traceable

Every animated transition must satisfy all three:

- Origin is visible
- Destination is visible
- Transformation is implied

If any of the three are missing, do not animate.

---

## 4. What Counts as a State (Important)

Phase 7 applies only to transitions between:

- Tool states (inactive → active)
- Selection states (none → selected → multi-selected)
- Mode lenses (mode A relevance → mode B relevance)
- Panel relevance (collapsed ↔ expanded)
- Timeline focus changes

It does not apply to:

- Data loading
- Network latency
- Error handling
- Long-running processes

---

## 5. Animation Types (Only These Are Allowed)

### 5.1 Relevance Shift (Primary)

Used when something becomes more or less important.

Allowed signals:
- Opacity shift
- Scale shift (<= 1.05x)
- Proximity shift (closer/further)

Duration:
- 80–120ms

Examples:
- Tool becomes active
- Panel becomes relevant
- Mode reweights tools

### 5.2 Spatial Continuity

Used when UI elements change position or hierarchy.

Rule:
Elements must appear to move, not disappear/reappear.

Examples:
- Panel collapsing
- Toolbar reordering
- PropertyBar content changing due to selection

### 5.3 Result Confirmation (Micro-feedback)

Used after an action completes successfully.

Examples:
- Snap
- Resize
- Align
- Commit

Duration:
- <= 100ms

Rule:
Confirmation motion must be smaller than discovery motion.

---

## 6. Forbidden Animation Patterns (Hard Fail)

The following automatically fail Phase 7 review:

- Fade-to-black / fade-to-white
- Full-screen transitions
- Bounce, elastic, spring-heavy easing
- Looping or idle animations
- Attention-seeking motion
- Motion that explains what happened instead of how

If animation explains behavior, it is a violation.
Animation may only explain relationship.

---

## 7. Mode Transitions (Critical)

### 7.1 Mode Entry

- No canvas reset
- No screen-wide transition
- No panel wipe

Allowed:
- Tool relevance shift
- Panel reweighting
- Subtle lens indicator appearance

Mental model:
Same space, different emphasis.

### 7.2 Mode Exit

- No reverse animation theatrics
- No collapse of user work

Mode exit must feel like relaxing constraints, not undoing work.

---

## 8. Panel Transitions

### 8.1 Appear

- Must be causally linked to user action
- Must expand from its anchor (edge, selection, cursor)
- Must not cover the canvas abruptly

### 8.2 Disappear

- Must retreat toward its origin
- Must not vanish instantly unless context is lost

---

## 9. Tool Activation / Deactivation

Activation:
- Tool moves closer to interaction focus
- Competing tools fade relevance
- Cursor or inline affordance reinforces activation

Deactivation:
- Tool retreats
- Residual affordance may linger briefly (<= 100ms)
- No hard off unless safety requires it

---

## 10. Timeline-Specific Motion

- Timeline cursor movement must feel continuous
- Range creation must expand, not appear
- Focus changes must slide, not jump
- Timeline motion must reinforce temporal causality, not progress

---

## 11. Performance Budget

- All animations must be frame-safe
- Dropped frames = UX violation
- Animation must degrade gracefully under load
- If performance is uncertain, remove animation

---

## 12. Review Checklist (Phase 7)

A PR touching animation must confirm:

- Animation explains a state relationship
- Duration <= 150ms
- No new animation systems introduced
- Interaction is never blocked
- Removal of animation does not break UX
- Motion reinforces spatial continuity
- No forbidden animation patterns used

Failure of any item blocks merge.

---

## 13. Phase Boundary

Phase 7 is complete when:

- All state changes feel traceable
- No animation distracts from intent
- Motion consistently reinforces the mental model
- Animation can be removed without logical loss

---

## 14. Phase 7 Summary (One Line)

Animation in Dropple exists to preserve understanding, not to impress.

