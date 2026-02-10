# Milestone 4 — Template Creation
## Tier 1 + Tier 2 GitHub Issues (Solo‑Dev Ready)

---

## Tier 1 — Foundations (Must Be Done First)

### Issue 4.1.1 — Define Template Metadata Model
**Type:** Core / Architecture  
**Priority:** P0  
**Milestone:** Template Creation (M4)

**Description**  
Define the canonical metadata structure for templates, completely separate from the canvas document graph.

Template metadata must include:
- name
- description
- category
- intent tags
- supported states
- preview references
- creator info
- versioning

**Constraints**
- Metadata must NOT live inside nodes
- Metadata changes must NOT mutate canvas state
- Normal documents must work without metadata

**Acceptance Criteria**
- Template metadata exists as a standalone model
- Canvas logic remains unaware of marketplace concerns
- Versioning is metadata‑only

---

### Issue 4.1.2 — Mark Document as Template
**Type:** Core  
**Priority:** P0  
**Milestone:** Template Creation (M4)

**Description**  
Allow any UIUX document to be flagged as a template.

This must:
- reuse the normal UIUX workspace
- not introduce a special editor
- be reversible

**Constraints**
- No template‑only node types
- No canvas behavior change when flagged

**Acceptance Criteria**
- Any document can toggle `isTemplate`
- Flag is stored outside node graph
- UIUX editing experience remains unchanged

---

### Issue 4.5.1 — Create New Document from Template
**Type:** Core  
**Priority:** P0  
**Milestone:** Template Creation (M4)

**Description**  
Allow users to spawn a new document from a template.

**Constraints**
- New document must be independent
- Template must remain unchanged
- IDs must be regenerated
- History must start clean

**Acceptance Criteria**
- New document created successfully from template
- No shared mutable state
- Undo works normally in new document

---

## Tier 2 — Trust & Safety (Critical UX)

### Issue 4.2.2 — Ghost Preview on Template Hover
**Type:** UX / Dropple‑Custom  
**Priority:** P1  
**Milestone:** Template Creation (M4)

**Description**  
Implement Ghost Preview when hovering over templates.

Preview must show:
- layout structure
- hierarchy
- motion illusion (if any)
- state transitions (visual only)

**Constraints**
- Hover only (no click)
- No commit
- No history entry
- No selection mutation

**Acceptance Criteria**
- Hover shows full visual preview
- Exit hover restores document perfectly
- Zero state mutation verified

---

### Issue 4.3.1 — Apply Template with Explicit Confirmation
**Type:** Core / UX  
**Priority:** P1  
**Milestone:** Template Creation (M4)

**Description**  
Allow users to apply a template only after explicit confirmation.

**Constraints**
- No auto‑apply
- Must support undo
- Must feel intentional

**Acceptance Criteria**
- Apply action is explicit
- Undo restores previous document state
- Visual transition is clear and predictable

---

### Issue 4.6.1 — Template Mutation Guard
**Type:** Safety / Architecture  
**Priority:** P1  
**Milestone:** Template Creation (M4)

**Description**  
Guarantee that template preview, explain, and inspection flows cannot mutate state.

This includes:
- Ghost Preview
- Explain tool
- Gallery browsing

**Constraints**
- No resolver side effects
- No history writes
- No selection leaks

**Acceptance Criteria**
- All preview paths are read‑only
- Mutation attempts are impossible by design
- Deterministic behavior confirmed

---

## Tier 1 + 2 Exit Check (Non‑Negotiable)
Tier 1 + Tier 2 are DONE only if:
- Templates exist as first‑class entities
- Templates can be previewed safely
- Applying templates is explicit and reversible
- No preview path can mutate state
- UIUX remains the only authoring workspace
- Architecture remains capability‑driven

---

## Explicitly Not Included Yet
Do NOT implement yet:
- Template gallery UI
- Template duplication
- Marketplace publishing
- Monetization
- Remixing
- AI Fix / Extend

Those come after trust is earned.
