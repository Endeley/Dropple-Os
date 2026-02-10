# Dropple v1 — Floating / Ephemeral Tools (LOCKED)

## Global Rules for Floating Tools (v1 law)
Floating tools must be:
- Optional (never required)
- One action, one click
- No forms
- No state memory
- Context-only (selection or cursor)
- Capability-gated (disappear if not allowed)

If a tool violates any of these → ❌ not v1.

---

## V1 Approved Floating Tools
Safe, expressive, and accelerate common actions.

### 1. Selection Affordances (always present)
These are not “tools” to the user — they are affordances.

| Floating UI | Capability | Notes |
| --- | --- | --- |
| Selection Outline | `node.select` | Always visible |
| Resize Handles | `layout.write` | UIUX only |
| Rotate Handle | `layout.write` | Only if implemented |
| Hover Highlight | `node.read` | Visual only |

If capability missing → do not render (not disabled).

---

### 2. Quick Actions Palette (v1 minimal)
Appears near selection (subtle) or via shortcut (later).

**v1 allowed actions**
| Action | Capabilities |
| --- | --- |
| Duplicate | `node.duplicate` |
| Delete | `node.delete` |
| Align Center | `layout.write` |
| Wrap in Frame | `node.create`, `layout.write` |

Why these:
- Extremely common
- One-step
- No ambiguity
- No configuration

Not in v1:
- No multi-align menus
- No distribution
- No “advanced” actions

---

### 3. Inline Text Editing (UIUX only)
Appears only when text is selected.

| Feature | Capability |
| --- | --- |
| Cursor / Typing | `content.write` |
| Text Selection | `content.read` |

No floating font panels in v1. Typography controls stay in the Inspector.

---

### 4. Ghost Preview (v1 visual-only)
Dropple-custom, minimal in v1.

**What v1 Ghost Preview can do**
- Show visual preview on hover
- No commit
- No history
- No AI reasoning yet

| Use case | Capability |
| --- | --- |
| Layout suggestion preview | `layout.read` |
| Motion hint preview | `motion.read` |
| Template preview | `content.read` |

No “Apply” buttons in v1. No timeline mutation. No AI auto-fix.

---

## Explicitly NOT in v1 (locked)
- Floating Inspector panels
- Floating Auto Layout editor
- Floating Color Picker
- Floating Timeline
- Floating AI Chat
- Floating Brand Controls
- Multi-step context menus

All of these either:
- duplicate the Inspector
- increase cognitive load
- risk inconsistency

They come later.

---

## Why this v1 set is perfect
- Matches infinite canvas vision
- Keeps sidebars authoritative
- Makes the editor feel fast, not noisy
- Introduces Dropple-only ideas (Ghost Preview) safely
- Zero conflict with capability system
- Zero duplication risk

---

## Final v1 Floating Tool List (Summary)
**Always**
- Selection outline
- Hover highlight

**Contextual**
- Resize / rotate handles
- Inline text edit

**Quick Actions**
- Duplicate
- Delete
- Align center
- Wrap in frame

**Dropple-only**
- Ghost Preview (visual-only)

Everything else waits.
