# Dropple v1 — Workspace Capability Map (Canonical)

## Global Rules (Non-Negotiable)
- Workspaces are allow-lists, never deny-lists
- If a capability is not listed, it is not allowed
- UI renders based on this map only
- v2 = unlocking capabilities, not redefining tools

---

## 1. UIUX Workspace (Primary / Deep)
**Intent:** Design, layout, and style UI on an infinite canvas.  
This is the only workspace with write power in v1.

**Allowed capabilities**
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

- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`

- `project.read`
- `project.save`

**Explicitly NOT allowed (v1 lock)**
- `interaction.*`
- `motion.*`
- `component.create`
- `component.detach`
- `project.export`

---

## 2. Prototype Workspace (Shell / Read-Only)
**Intent:** Understand flow and interactions without editing.

**Allowed capabilities**
- `node.read`
- `node.select`

- `layout.read`
- `style.read`
- `content.read`

- `interaction.read`

- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`

- `project.read`

**Notes**
- No node creation
- No layout edits
- No interaction authoring
- Inspector is read-only

This workspace shows structure, not power.

---

## 3. Motion Workspace (Shell / Read-Only)
**Intent:** View animation & motion structure (future-ready).

**Allowed capabilities**
- `node.read`
- `node.select`

- `motion.read`

- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`

- `project.read`

**Notes**
- No timeline editing
- No keyframes
- No playback editing
- Canvas is a viewer, not an editor

---

## 4. Inspect / Dev Workspace (Internal)
**Intent:** Debug, inspect, and reason about the document.

**Allowed capabilities**
- `node.read`

- `layout.read`
- `style.read`
- `content.read`

- `component.read`
- `interaction.read`
- `motion.read`

- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`

- `project.read`

**Notes**
- No mutation of any kind
- Pure inspection

---

## 5. Global Capabilities (Implicitly Allowed Everywhere)
These are non-destructive and safe.
- `viewport.pan`
- `viewport.zoom`
- `viewport.fit`
- `project.read`

---

## Visual Summary (Mental Model)
- UIUX → FULL WRITE (design)
- Prototype → READ ONLY (flow)
- Motion → READ ONLY (motion)
- Inspect → READ ONLY (system)

Only UIUX mutates the document in v1.

---

## Why This Map Is Correct
- Matches the UI you liked
- Prevents half-working tools
- Allows shells without lies
- Makes v2 obvious (unlock, don’t rewrite)
- Keeps implementation simple

This map is now law unless you decide otherwise.
