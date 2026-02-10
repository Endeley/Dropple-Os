# DROPPLE v1 — UI LOCK DOCUMENT (CANONICAL)

## Status
- **Phase:** v1 UI Lock
- **Scope:** UI/UX Workspace (deep) + other workspaces (shell)
- **Change Policy:** Any change to this document = explicit version bump

---

## GLOBAL LAWS (NON-NEGOTIABLE)
- One canvas, many disciplines
- Intent before implementation
- Tools never know workspaces
- Capabilities decide visibility
- Sidebars are truth, floating UI is speed
- No half-working UI
- v1 favors clarity over power
- v2 unlocks, never rewrites

---

## UI LAYER LAW
The editor has exactly three UI layers:

- Left → Structural / Intent
- Right → Structural / State (Inspector)
- Floating → Contextual / Ephemeral

No tool may violate its layer’s responsibility.

---

## LEFT SIDEBAR — INTENT TOOLS (LOCKED)
**Purpose**
- Defines what clicking on the canvas does
- Persistent
- Workspace-aware
- Never contextual

**v1 Visible Tools**

Core Canvas / View
- Select
- Pan / Hand
- Zoom
- Fit to Screen

Node Creation (UIUX only)
- Frame
- Text
- Shape
- Image

**Rule**
If `node.create` is not allowed → tool is hidden.

**v1 Hidden (exist conceptually)**
- Prototype authoring tools
- Motion authoring tools
- Timeline tools
- AI command input

---

## RIGHT SIDEBAR — INSPECTOR (LOCKED)
**Purpose**
- Shows truth
- Edits existing selection
- Never changes click behavior

Inspector always mounts, content is gated.

**v1 Inspector Sections**

Structure
- Layers Panel (read/select)
- Pages / Frames Panel (read/select)

Layout
- Position & Size
- Constraints
- Auto Layout

Style
- Fill & Stroke
- Background
- Border Radius
- Opacity

Content
- Text Properties
- Image Replace

Components
- Component Info (read-only)

**Read‑Only Rule**
If only `*.read` capability exists:
- Values visible
- Controls disabled
- No mutation

---

## FLOATING UI — CONTEXTUAL / EPHEMERAL (LOCKED)
**Purpose**
- Speed
- Discovery
- Illusion
- Never required

**v1 Floating Elements**

Selection Affordances
- Selection Outline
- Hover Highlight
- Resize Handles (UIUX only)
- Rotate Handle (only if implemented)

Quick Actions (FINAL)
Exactly these six:
- Duplicate
- Delete
- Align Center
- Wrap in Frame
- Group
- Ungroup

**Rules**
- One click
- No configuration
- Capability‑gated
- Disappear if not allowed

Dropple‑Custom Floating
- Ghost Preview (v1: visual‑only)
  - Hover previews
  - No commit
  - No history
  - No AI mutation
  - Used for:
    - Layout hints
    - State previews
    - Intent suggestions
    - Template previews

---

## DROPPLE‑CUSTOM TOOLS — v1 SURFACE MAP

**What exists in v1 (surface / passive)**

| Tool | Layer | v1 Behavior |
| --- | --- | --- |
| State Composer | Left | State definition only |
| Time Lens | Left | Subtle scrub / preview |
| Intent Dial | Right | Read‑only + suggest |
| Explain | Right | Explain only |
| Ghost Preview | Floating | Visual only |
| Component Memory | Right | Read‑only |
| Visual Balance Hints | Floating | Passive |

**Locked (v2+)**
- Animate Between States (full)
- Intent free‑text commands
- AI Fix / Extend
- Motion Doctor
- Loop Architect
- Brand Gravity controls
- Variant Matrix
- Token‑driven motion editor
- Timeline editing
- Merge / Unmerge tools

---

## WORKSPACE BEHAVIOR (LOCKED)

**UIUX Workspace**
- Full authoring
- Only workspace with write power in v1

**Prototype Workspace**
- Read‑only
- Structure + interaction visibility only

**Motion Workspace**
- Read‑only
- Motion visibility only

**Inspect / Dev Workspace**
- Read‑only
- System inspection only

---

## CAPABILITY LAW (REMINDER)
- Tools declare required capabilities
- Workspaces declare allowed capabilities
- Modes may lock capabilities

UI computes:
- ACTIVE
- READ‑ONLY
- HIDDEN

No tool contains workspace logic.

---

## EXPLICIT NON‑GOALS FOR v1
- No full animation authoring
- No AI auto‑apply
- No floating inspectors
- No merge semantics
- No collaboration
- No marketplace editing

---

## v1 SUCCESS CRITERIA
Dropple v1 is successful if:
- UIUX workspace feels complete
- Other workspaces feel honest, not broken
- No control lies about power
- Ghost Preview feels magical but safe
- Users trust the editor
- v2 feels like an unlock, not a rewrite

---

## FINAL LOCK STATEMENT
This document defines Dropple v1 UI behavior.  
Any deviation requires explicit version change.

You now have:
- a capability spine
- a UI layer law
- a Dropple‑custom overlay
- a v1 surface lock
- zero duplication risk

This is the point where implementation can safely begin — when you’re ready.
