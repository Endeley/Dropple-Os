# DROPPLE v1 — IMPLEMENTATION CHECKLIST

This checklist is derived directly from the v1 UI Lock Document.

It is written so that:
- nothing new is invented
- nothing is overridden
- nothing is duplicated
- every step is verifiable

You can tick these off one by one.

---

## PHASE 0 — SAFETY FIRST (MANDATORY)
- Do NOT delete any existing files
- Do NOT rename any folders
- Do NOT duplicate tools
- All new logic must be additive (new files or thin wrappers)
- Existing tools remain dumb (emit intent only)

If any task violates this → stop.

---

## PHASE 1 — CAPABILITY FOUNDATION

### 1. Capability Vocabulary
- Create a single canonical capability list
- Ensure all strings match the locked vocabulary:
  - `node.*`, `layout.*`, `style.*`, `content.*`, `component.*`, `interaction.*`, `motion.*`, `viewport.*`, `project.*`
- No workspace logic here

✅ Output: one file exporting capability constants

### 2. Workspace Capability Maps
- Define allow-lists per workspace:
  - UIUX
  - Prototype
  - Motion
  - Inspect / Dev
- UIUX is the only workspace with write capabilities
- No deny-lists
- No UI imports

✅ Output: workspace → capability allow-map

### 3. Mode Locks (optional but clean)
- Define mode-based capability locks (Inspect mode, Preview mode, etc.)
- Mode logic must subtract, never add capabilities

---

## PHASE 2 — TOOL AVAILABILITY ENGINE

### 4. Tool Capability Registry
- For each existing tool, declare required capabilities
- Do this outside the tool file
- No tool should import workspace info

✅ Output: toolId → requiredCapabilities map

### 5. Availability Resolver
Implement a single resolver that returns:
- ACTIVE
- READ_ONLY
- HIDDEN

Inputs:
- toolId
- workspace
- mode

Logic:
- if capability missing → HIDDEN
- if capability locked → READ_ONLY
- else → ACTIVE

✅ This function becomes law.

---

## PHASE 3 — UI LAYER ENFORCEMENT

### 6. LEFT SIDEBAR (Intent Tools)
- Render tools only if availability ≠ HIDDEN
- Disable tools if READ_ONLY
- Ensure Left Sidebar contains only:
  - Select
  - Pan / Zoom / Fit
  - Frame / Text / Shape / Image (UIUX only)
- No contextual logic
- No floating behavior

### 7. RIGHT SIDEBAR (Inspector)
- Inspector always mounts
- Sections render only if capability `.read` exists
- Inputs enabled only if `.write` exists
- No mutation allowed from read-only sections
- No floating inspector panels

### 8. FLOATING UI (Contextual / Ephemeral)
Selection Affordances
- Selection outline renders with `node.select`
- Resize handles render only with `layout.write`
- Rotate handle renders only if implemented + `layout.write`

Quick Actions (FINAL SET — EXACT)
- Duplicate (`node.duplicate`)
- Delete (`node.delete`)
- Align Center (`layout.write`)
- Wrap in Frame (`node.create` + `layout.write`)
- Group (`node.group`)
- Ungroup (`node.ungroup`)

Rules to verify:
- One click only
- No config
- No confirmation dialogs
- Disappear if capability missing

---

## PHASE 4 — DROPPLE-CUSTOM v1 SURFACE

### 9. Ghost Preview (Visual-Only)
Ghost Preview must:
- never mutate state
- never write history
- never auto-apply
- triggered by hover or suggestion
- uses read-only capabilities only

### 10. State Composer (v1 Lite)
- Allow defining states (Idle, Hover, etc.)
- No timelines
- No keyframes
- Preview only via Ghost Preview

### 11. Time Lens (Subtle)
- Subtle scrub / preview control
- No editing
- No tracks
- Works in all workspaces as viewer

### 12. Intent Dial (Read-Only)
- Display detected intent
- Suggest changes only
- No auto-apply

### 13. Explain Tool
- “Explain why this feels like this”
- Read-only analysis
- No Fix / Extend in v1

---

## PHASE 5 — WORKSPACE VALIDATION

### 14. UIUX Workspace
- Full authoring works
- Inspector editable
- Floating tools active
- No hidden half-features

### 15. Prototype Workspace
- No node creation
- Inspector read-only
- Floating actions hidden or disabled
- Feels intentional, not broken

### 16. Motion Workspace
- Motion visible
- No timeline editing
- No keyframes
- Viewer-only experience

### 17. Inspect / Dev Workspace
- Pure inspection
- No mutation paths exist
- Debug views only

---

## PHASE 6 — FINAL LOCK CHECKS
- No tool checks workspace directly
- No duplicated tools exist
- No floating inspector panels
- No merge / unmerge semantics
- No AI auto-apply
- No hidden state mutation

---

## v1 DONE CRITERIA
You are done when:
- UIUX feels complete
- Other workspaces feel honest
- No UI lies about power
- Ghost Preview feels magical but safe
- v2 features are visible but locked
- No architectural shortcuts exist
