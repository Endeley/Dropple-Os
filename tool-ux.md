# Tool UX Contract (Phase 6)

Status: Draft (UX-Locked)
Scope: UX behavior only. No new systems or capabilities.

This document defines the required Tool UX rules for Dropple OS. It is
architecture-aligned and must not contradict locked Phases 1–5 or the tool
contracts.

If a UI change violates any rule here, it is invalid by definition.

---

## 1) Core Principles (Non-Negotiable)

1. Single brain / single canvas / single timeline is always visible.
2. Tools reveal capability; they never invent new behavior.
3. Tool UX teaches by action, not instruction.
4. Panels describe potential, not absence.
5. Modes reweight tool relevance; they do not redefine tool identity.

---

## 2) First-Launch & Empty Workspace

Required:
- Canvas is visible immediately.
- Timeline is visible and shows potential, even with zero events.
- Property bar never renders a blank or empty state.

Forbidden:
- Empty or placeholder-only panels.
- "Nothing here yet" copy.
- Modal onboarding or walkthroughs.

---

## 3) Empty State Rules (Critical)

Empty tool panels are not allowed.

If a tool or panel has no applicable data, it MUST:
- Show action-first copy (verb-led).
- Show a ghost affordance, not a blank box.
- Collapse when it has no contextual relevance.

---

## 4) Tool Discoverability Layers

All tools must have a visibility layer:

- Latent: Hidden until intent exists.
- Suggestive: Appears as a hint tied to context.
- Explicit: Full controls shown once intent is clear.

Rules:
- Tools must not appear Explicit on first contact.
- Context or selection must trigger appearance.
- Results reinforce discovery (no tutorial UI).

---

## 5) Tool Surface Zoning

Toolbar:
- Invocation only.
- Never empty.
- Ordered by current relevance.

Property Bar:
- Explains the current selection.
- Shows parameters only when selection exists.
- When nothing is selected, shows action-first copy.

Left/Right Panels:
- Advanced or contextual tools only.
- Collapse when context is lost.

Inline Canvas Controls:
- Primary discovery surface.
- Reversible and low-friction.

Timeline Bar:
- Temporal tools only.
- No creation tools.
- Shows ghost range when empty.

---

## 6) Mode Entry / Exit

Entry:
- Preserve canvas and timeline continuity.
- Reweight tools, do not replace them.
- No confirmation dialogs.

Exit:
- No destructive changes.
- Feels like zooming out, not leaving.

---

## 7) Tool State Transitions

Rules:
- No hard tool switching.
- Active tools move closer to focus.
- Inactive tools retreat, dim, or collapse.

---

## 8) Feedback & Affordances

Allowed:
- Cursor changes
- Inline highlights
- Subtle motion (<=150ms)
- Temporary inline labels (e.g., "Snapped")

Disallowed:
- Toasts
- Modals
- Persistent banners
- Interruptive messaging

---

## 9) Reversibility & Safety

Required:
- Undo is always visible.
- Recovery is obvious after any action.

---

## 10) Enforcement

Any PR touching Tool UX must:
- Acknowledge this contract.
- Pass the UI Implementation Checklist.
- Avoid introducing new UX systems.

