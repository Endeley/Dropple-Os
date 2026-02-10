# Dropple Capability Vocabulary (v1 — Canonical)

**Core rule (read once)**
- Capabilities are verbs, not UI
- They describe what is allowed, not how
- They are stable across v1 → v2
- New features unlock capabilities; they don’t invent new ones casually
- If something can’t be expressed with this list, it probably shouldn’t ship

---

## 1. Node Capabilities (fundamental)
Base of everything:
- `node.read`        // see nodes, select, inspect
- `node.select`      // change selection
- `node.create`      // create any node
- `node.delete`      // delete node
- `node.duplicate`   // duplicate node

Optional (v1-safe, unlock later):
- `node.group`
- `node.ungroup`

---

## 2. Layout Capabilities (geometry & structure)
- `layout.read`        // view layout values
- `layout.write`       // change size, position, alignment
- `layout.constraints` // constraints / pins
- `layout.autolayout`  // auto layout / flow

**Notes**
- `layout.read` ≠ editable
- Prototype & Motion are usually `layout.read` only in v1

---

## 3. Style Capabilities (visual appearance)
- `style.read`
- `style.write`

Covers:
- fill
- stroke
- border radius
- background
- opacity
- effects (later)

No need to fragment further in v1.

---

## 4. Content Capabilities (text, media)
- `content.read`
- `content.write`

Used for:
- text editing
- image assignment
- component content overrides (later)

---

## 5. Component / Structure Capabilities (future-safe)
- `component.read`
- `component.create`
- `component.detach`

In v1: mostly `component.read`.

---

## 6. Interaction / Prototype Capabilities (mostly v2)
Defined now so UI can exist safely.
- `interaction.read`
- `interaction.write`
- `interaction.preview`

In v1: usually `interaction.read` at most.

---

## 7. Motion / Animation Capabilities (v2+)
- `motion.read`
- `motion.write`
- `motion.preview`

UI can render; tools stay disabled in v1.

---

## 8. Viewport / Canvas Capabilities (safe everywhere)
- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`

Non-destructive; safe in all workspaces.

---

## 9. System / Meta Capabilities
- `project.read`
- `project.save`
- `project.export`

Publishing/exporting can hang off these.

---

## Final Canonical List (flattened)
This is the exact list recommended to lock for v1:

- `node.read`
- `node.select`
- `node.create`
- `node.delete`
- `node.duplicate`

- `layout.read`
- `layout.write`
- `layout.constraints`
- `layout.autolayout`

- `style.read`
- `style.write`

- `content.read`
- `content.write`

- `component.read`
- `component.create`
- `component.detach`

- `interaction.read`
- `interaction.write`
- `interaction.preview`

- `motion.read`
- `motion.write`
- `motion.preview`

- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`

- `project.read`
- `project.save`
- `project.export`

---

## Why this is the right size
- Small enough to reason about
- Expressive enough for every tool shown
- Stable across all workspaces
- Zero coupling to UI layout
- No duplication risk
