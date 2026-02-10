# Milestone 2 — UIUX Workspace (Production‑Ready)

**Milestone Goal:** Ship a trustworthy, complete UIUX editor where every visible control works exactly as promised.

---

## EPIC 2.1 — Workspace Shell & Capability Wiring

### Issue 2.1.1 — Wire UIUX Workspace to Capability Engine
**Type:** Core

**Description**
- Connect UIUX workspace to capability allow‑list
- Ensure UIUX is the only workspace with write capabilities
- No tool checks workspace directly

**Acceptance Criteria**
- Switching workspace changes tool availability correctly
- No hardcoded `if (uiux)` logic exists inside tools

---

### Issue 2.1.2 — Enforce ACTIVE / READ‑ONLY / HIDDEN States
**Type:** Core

**Description**
- Use availability resolver for all tools
- ACTIVE → enabled
- READ‑ONLY → visible but disabled
- HIDDEN → not rendered

**Acceptance Criteria**
- Every tool follows the same availability rule
- No UI element bypasses the resolver

---

## EPIC 2.2 — Left Sidebar (Intent Tools)

### Issue 2.2.1 — Finalize Core Canvas Tools
**Tools**
- Select
- Pan / Hand
- Zoom
- Fit to Screen

**Acceptance Criteria**
- Tools are always available in UIUX
- Tools change cursor / interaction mode correctly
- No mutation bugs

---

### Issue 2.2.2 — Node Creation Tools (UIUX Only)
**Tools**
- Frame
- Text
- Shape
- Image

**Acceptance Criteria**
- Tools emit creation intent only
- Nodes appear with correct defaults
- Selection resolves correctly after creation
- Tools are hidden outside UIUX

---

## EPIC 2.3 — Right Sidebar (Inspector)

### Issue 2.3.1 — Inspector Always Mounts
**Description**
- Inspector shell is always present
- Content adapts to selection + capabilities

**Acceptance Criteria**
- Empty state shown when nothing selected
- No inspector flicker on selection change

---

### Issue 2.3.2 — Structure Panels
**Panels**
- Layers
- Pages / Frames

**Acceptance Criteria**
- Node select works
- Reordering (if supported) works
- Creation actions gated by `node.create`
- Read‑only enforced when needed

---

### Issue 2.3.3 — Layout Inspector (Read / Write Split)
**Panels**
- Position & Size
- Constraints
- Auto Layout

**Acceptance Criteria**
- Values visible with `layout.read`
- Inputs enabled only with `layout.write`
- No accidental mutation in read‑only mode

---

### Issue 2.3.4 — Style Inspector
**Panels**
- Fill & Stroke
- Background
- Border Radius
- Opacity

**Acceptance Criteria**
- Read/write split enforced
- Disabled controls are visually clear
- Style updates propagate correctly

---

### Issue 2.3.5 — Content Inspector
**Panels**
- Text Properties
- Image Replace

**Acceptance Criteria**
- Inline text edit syncs with inspector
- Content editing respects capabilities
- No UI mismatch between canvas and inspector

---

## EPIC 2.4 — Canvas Interaction & Selection

### Issue 2.4.1 — Selection & Multi‑Selection
**Description**
- Click to select
- Shift / multi‑select (if supported)

**Acceptance Criteria**
- Selection state always correct
- Inspector updates immediately
- No ghost selections

---

### Issue 2.4.2 — Resize & Rotate Handles
**Description**
- Render contextual handles only when allowed

**Acceptance Criteria**
- Handles appear only with `layout.write`
- Handles never appear in read‑only mode
- Interactions feel stable and predictable

---

## EPIC 2.5 — Floating Quick Actions (FINAL SET)

### Issue 2.5.1 — Implement Quick Actions Palette
**Actions (exactly these)**
- Duplicate
- Delete
- Align Center
- Wrap in Frame
- Group
- Ungroup

**Acceptance Criteria**
- One click per action
- No dialogs
- Capability‑gated
- Disappear if not allowed
- Appear near selection

---

### Issue 2.5.2 — Group / Ungroup Behavior
**Description**
- Group creates simple container
- Ungroup restores children

**Acceptance Criteria**
- No auto‑layout
- No semantic conversion
- Pure structural grouping

---

## EPIC 2.6 — Ghost Preview (UIUX Scope)

### Issue 2.6.1 — Visual‑Only Ghost Preview
**Description**
- Hover previews for:
  - layout suggestions
  - state previews
  - intent hints

**Acceptance Criteria**
- No state mutation
- No history entry
- Preview disappears on exit

---

## EPIC 2.7 — UX Polish & Stability

### Issue 2.7.1 — Empty & Edge States
**Description**
- No selection
- Invalid selection
- Mixed selection

**Acceptance Criteria**
- UI never breaks
- Inspector always shows something sensible

---

### Issue 2.7.2 — Performance & Feel Pass
**Description**
- Canvas interaction smoothness
- Inspector input responsiveness

**Acceptance Criteria**
- No jank during drag / resize
- No unnecessary re‑renders

---

## Milestone 2 Exit Criteria (Non‑Negotiable)
Milestone 2 is DONE only if:
- UIUX workspace can design real layouts end‑to‑end
- Every visible control works or is honestly disabled
- No mutation happens outside intent system
- Floating UI accelerates but never blocks
- Inspector is the single source of truth
- No duplication or overrides exist
