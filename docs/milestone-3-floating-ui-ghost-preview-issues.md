# Milestone 3 — Floating UI + Ghost Preview Expansion

**Milestone Goal:** Make the canvas feel alive, fast, and intelligent while guaranteeing:
- zero accidental mutation
- zero inspector replacement
- zero architectural shortcuts

---

## EPIC 3.1 — Floating UI Infrastructure

### Issue 3.1.1 — Create Floating UI Root
**Type:** Core

**Description**
- Introduce a single Floating UI root layer
- Anchored to canvas viewport
- Z‑indexed above canvas, below modals

**Acceptance Criteria**
- Floating UI renders independently of sidebars
- No layout shift in canvas
- No dependency on inspector state

---

### Issue 3.1.2 — Contextual Positioning Engine
**Type:** Core

**Description**
- Position floating elements relative to:
  - selection bounds
  - cursor (when needed)
- Handle zoom + pan correctly

**Acceptance Criteria**
- Floating UI stays aligned during zoom/pan
- No jitter
- No clipping at viewport edges

---

## EPIC 3.2 — Quick Actions (Polish & Expansion)

### Issue 3.2.1 — Refine Quick Actions Appearance
**Description**
- Visual grouping
- Clear affordances
- Minimal chrome

**Acceptance Criteria**
- Actions feel lightweight
- Never obstruct content
- Fade in/out smoothly

---

### Issue 3.2.2 — Capability‑Gated Visibility
**Description**
- Each action appears only if capability is allowed

**Acceptance Criteria**
- No disabled floating actions
- Missing capability → action not rendered
- Matches availability resolver behavior

---

### Issue 3.2.3 — Multi‑Selection Awareness
**Description**
- Adapt Quick Actions based on:
  - single selection
  - multi‑selection

**Acceptance Criteria**
- Invalid actions do not appear
- Group / Ungroup logic adapts correctly

---

## EPIC 3.3 — Ghost Preview System (Expansion)

### Issue 3.3.1 — Ghost Rendering Layer
**Type:** Core

**Description**
- Dedicated render layer for ghost previews
- Separate from real canvas state

**Acceptance Criteria**
- Ghost visuals never enter real node tree
- Clear visual distinction (opacity, blur, color)
- Easy to remove/clear

---

### Issue 3.3.2 — Layout Ghost Previews
**Description**
- Preview layout changes on hover:
  - align center
  - wrap in frame
  - auto layout suggestion (visual only)

**Acceptance Criteria**
- Hover → preview
- Exit → revert
- No history entry
- No state mutation

---

### Issue 3.3.3 — State Transition Ghosts (UIUX Scope)
**Description**
- Preview state changes (Idle → Hover, etc.)

**Acceptance Criteria**
- Time‑based preview only
- No keyframes written
- No timeline created

---

### Issue 3.3.4 — Template Ghost Preview
**Description**
- Preview templates without committing
- Show motion + layout illusion

**Acceptance Criteria**
- Preview feels real
- Cancel leaves document untouched
- No selection side‑effects

---

## EPIC 3.4 — Dropple Intelligence (Passive)

### Issue 3.4.1 — Visual Balance Hints
**Description**
- Subtle indicators for:
  - visual weight
  - imbalance
  - alignment tension

**Acceptance Criteria**
- Passive only (no controls)
- Never blocks interaction
- Helps explain “why this feels off”

---

### Issue 3.4.2 — Intent Hint Overlays
**Description**
- Surface hints like:
  - “This feels abrupt”
  - “This transition is heavy”

**Acceptance Criteria**
- Hints are dismissible
- No auto‑fix
- No mutation

---

## EPIC 3.5 — Safety & Trust Guarantees

### Issue 3.5.1 — Ghost Preview Safety Audit
**Description**
- Verify ghost system cannot:
  - mutate state
  - write history
  - affect selection

**Acceptance Criteria**
- All ghost actions are reversible by design
- No edge‑case leaks

---

### Issue 3.5.2 — Inspector Non‑Interference Check
**Description**
- Ensure floating UI never replaces inspector workflows

**Acceptance Criteria**
- Inspector remains authoritative
- Floating UI never exposes deep config

---

## Milestone 3 Exit Criteria (Strict)
Milestone 3 is DONE only if:
- Floating UI feels fast, light, and optional
- Quick Actions are perfectly predictable
- Ghost Preview feels magical but safe
- No accidental mutations are possible
- Inspector remains the single source of truth
- UIUX workspace feels alive, not cluttered
