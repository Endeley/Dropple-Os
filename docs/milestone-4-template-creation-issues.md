# Milestone 4 — Template Creation (Production‑Ready)

**Milestone Goal:** Make templates a first‑class, safe, intelligent feature built entirely on the UIUX workspace.

Templates must feel:
- alive
- explainable
- adaptable
- non‑destructive

---

## EPIC 4.1 — Template Identity & Metadata

### Issue 4.1.1 — Define Template Metadata Model
**Type:** Core

**Description**
Define template metadata without affecting document structure.

Metadata includes:
- template name
- category (UI, social, brand, motion, etc.)
- supported states
- intent tags (e.g. calm, bold, playful)
- preview thumbnail refs

**Acceptance Criteria**
- Metadata lives outside the node graph
- Editing metadata never mutates canvas state
- Metadata is optional for normal documents

---

### Issue 4.1.2 — Mark Document as Template
**Description**
Allow a UIUX document to be flagged as a template.

**Acceptance Criteria**
- Any normal document can become a template
- No template‑only editor exists
- Flag is reversible
- Canvas behavior does not change

---

## EPIC 4.2 — Template Preview & Discovery

### Issue 4.2.1 — Template Gallery (Read‑Only)
**Description**
Create a gallery view listing available templates.

**Acceptance Criteria**
- Gallery is read‑only
- No mutation possible from gallery
- Metadata + thumbnail visible
- Performance friendly

---

### Issue 4.2.2 — Ghost Preview on Template Hover
**Description**
Use Ghost Preview to show templates before applying.

Preview includes:
- layout
- hierarchy
- motion illusion
- state transitions (if any)

**Acceptance Criteria**
- Hover shows preview
- Exit hover leaves document untouched
- No history entry
- No selection side effects

---

### Issue 4.2.3 — Template Fit Hinting
**Description**
Provide passive hints:
- “Fits mobile well”
- “Dense layout”
- “Animated intro”

**Acceptance Criteria**
- Informational only
- No auto‑apply
- No configuration UI

---

## EPIC 4.3 — Applying Templates Safely

### Issue 4.3.1 — Apply Template with Confirmation
**Description**
Allow user to apply template after preview.

**Acceptance Criteria**
- Explicit apply action required
- Undo restores previous document
- Clear visual transition

---

### Issue 4.3.2 — Content Slot Mapping
**Description**
Map template placeholders to user content.

Examples:
- text → text
- image → image
- button → button

**Acceptance Criteria**
- Reasonable defaults
- No silent data loss
- User can override later

---

## EPIC 4.4 — Intent Preservation

### Issue 4.4.1 — Preserve Template Intent on Edit
**Description**
Ensure template intent survives user customization.

**Acceptance Criteria**
- Layout changes do not destroy hierarchy
- Motion intent remains consistent
- Spacing adapts intelligently

---

### Issue 4.4.2 — Explain Template Decisions (Read‑Only)
**Description**
Integrate Explain tool for templates.

Examples:
- “Why is this spaced like this?”
- “Why does this animation feel smooth?”

**Acceptance Criteria**
- Explain is informational only
- No Fix / Extend in v1
- Builds user trust

---

## EPIC 4.5 — Template Reuse & Duplication

### Issue 4.5.1 — Create New Document from Template
**Description**
Spawn a new document using a template.

**Acceptance Criteria**
- New doc is independent
- Template remains unchanged
- History starts clean

---

### Issue 4.5.2 — Duplicate Template
**Description**
Allow template creators to duplicate templates.

**Acceptance Criteria**
- Metadata duplicated
- IDs regenerated
- No shared mutable state

---

## EPIC 4.6 — Safety, Trust & Constraints

### Issue 4.6.1 — Template Mutation Guard
**Description**
Ensure template previews and explanations never mutate state.

**Acceptance Criteria**
- No history pollution
- No resolver side effects
- Deterministic behavior

---

### Issue 4.6.2 — Template Capability Compliance
**Description**
Ensure templates respect workspace capability rules.

**Acceptance Criteria**
- Applying template does not unlock forbidden capabilities
- Template adapts to workspace, not vice versa

---

## Milestone 4 Exit Criteria (Strict)
Milestone 4 is DONE only if:
- Templates are created using UIUX workspace
- Templates can be previewed safely via Ghost Preview
- Applying templates is explicit and reversible
- Templates preserve intent under customization
- Templates are explainable
- No duplicate editors or special cases exist
