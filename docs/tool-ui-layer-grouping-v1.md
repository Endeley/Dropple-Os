# Dropple v1 — Tool ↔ UI Layer Grouping (Canonical)

## Global Layer Rules (Locked)
- Left = Intent (what clicking does)
- Right = State (what this thing is)
- Floating = Context / Speed (do this faster, right now)

No tool may violate its layer’s responsibility.

---

## Left Sidebar
**Structural · Intent Tools**
(Changes what user interaction does on the canvas)

These tools are modeled as “active tools”.

### 1. Core Canvas / View Tools
| Tool | Capability |
| --- | --- |
| Select | `node.select` |
| Pan / Hand | `viewport.pan` |
| Zoom | `viewport.zoom` |
| Fit to Screen | `viewport.fit` |

Rules:
- Always visible
- Always safe
- Never float

### 2. Node Creation Tools (UIUX power tools)
| Tool | Capability |
| --- | --- |
| Frame | `node.create` |
| Text | `node.create`, `content.write` |
| Shape | `node.create` |
| Image | `node.create`, `content.write` |

If `node.create` is missing → hidden.
These must live on the left, never floating.

### 3. High‑Level Mode Tools (future‑safe)
| Tool | Capability |
| --- | --- |
| Prototype Mode Tool | `interaction.read` |
| Motion Mode Tool | `motion.read` |

These are workspace‑entry affordances, not editors.

---

## Right Sidebar
**Structural · State Tools (Inspector)**
Everything here:
- edits existing selection or
- shows its properties
- never changes click behavior

### 4. Selection / Structure Panels
| Panel | Capability |
| --- | --- |
| Layers Panel | `node.read`, `node.select` |
| Pages / Frames Panel | `node.read`, `node.select` |

Creation actions inside panels require `node.create`, otherwise read‑only.

### 5. Layout & Geometry (Inspector)
| Panel | Capability |
| --- | --- |
| Position & Size | `layout.read` / `layout.write` |
| Constraints | `layout.constraints` |
| Auto Layout | `layout.autolayout` |

With only `layout.read` → values visible, controls disabled.

### 6. Style / Visual Panels
| Panel | Capability |
| --- | --- |
| Fill & Stroke | `style.read` / `style.write` |
| Background | `style.read` / `style.write` |
| Border Radius | `style.read` / `style.write` |
| Opacity | `style.read` / `style.write` |

Inspector never floats.

### 7. Content Editing (Inspector Sections)
| Panel | Capability |
| --- | --- |
| Text Properties | `content.read` / `content.write` |
| Image Replace | `content.write` |

Inline editing may appear on canvas, but settings live here.

### 8. Component Panels (future‑safe)
| Panel | Capability |
| --- | --- |
| Component Badge (details) | `component.read` |
| Create Component | `component.create` (v1 hidden) |
| Detach Instance | `component.detach` (v1 hidden) |

### 9. Prototype / Interaction Panels (shell in v1)
| Panel | Capability |
| --- | --- |
| Interaction Panel | `interaction.read` |
| Preview | `interaction.preview` (hidden v1) |

Read‑only in v1.

### 10. Motion / Animation Panels (shell in v1)
| Panel | Capability |
| --- | --- |
| Motion Inspector | `motion.read` |
| Timeline | `motion.write` (hidden v1) |
| Playback Controls | `motion.preview` (hidden v1) |

---

## Floating UI
**Contextual + Ephemeral Tools**
(Appear near selection or cursor)

These never replace sidebars. They accelerate common actions.

### 11. Contextual Canvas Controls
| Control | Capability |
| --- | --- |
| Resize Handles | `layout.write` |
| Rotate Handle | `layout.write` |
| Selection Outline | `node.select` |
| Component Badge | `component.read` |

If capability missing → do not render (not disabled).

### 12. Quick / Ephemeral Actions
| Action | Capability |
| --- | --- |
| Duplicate | `node.duplicate` |
| Align Center | `layout.write` |
| Wrap in Frame | `node.create`, `layout.write` |
| Add Auto Layout | `layout.autolayout` |

Rules:
- Max 1 click
- No forms
- No deep config
- Context‑aware only

---

## Inspector Sections = Tools (Enforced)
```
Section {
  read: capability.read
  write: capability.write
}
```

Examples:
- Position → `layout.read` / `layout.write`
- Style → `style.read` / `style.write`
- Content → `content.read` / `content.write`

No exceptions.

---

## Why This Grouping Is Correct
- Left = intent
- Right = truth
- Floating = speed

And crucially:
- No duplication
- No workspace conditionals
- No tool knows where it lives — the shell decides
- Same tool works across UIUX / Prototype / Motion
- v2 = unlock capabilities, not reshuffle UI

---

## Status
- Tools classified
- Layers locked
- Capabilities respected
- No files touched for implementation
- No duplicates created
