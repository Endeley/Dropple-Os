# UIUX Inspector v1 — Final Spec (Ship-Ready)

## Core Principle (Non-Negotiable)
The UIUX Inspector v1 is:
- Deterministic
- Design-intent only
- Directly maps to DroppleSpec
- Feeds Templates, Export, and Translate
- No runtime behavior
- No hidden magic

If a property cannot be exported or translated, it does not belong here.

## Where This Lives (Already Exists)
You already have the right folders:

```
ui/
 ├── inspector/
 │   ├── LayoutInspector.jsx
 │   ├── AutoLayoutPanel.jsx
 │   └── (add here)
 ├── workspace/
 │   └── ux/
 │       ├── UXInspectorPanel.jsx   ← main entry
```

We extend, not restructure.

## Inspector Layout (Right Panel)
**UI Structure (fixed order)**
- Node Header
- Layout
- Content
- Semantics
- Motion (read-only)
- Export Preview

Each section is collapsible, but always ordered.

## 1. Node Header (Required)
**Purpose:** Selection clarity and structure awareness.

**Fields**
- Node Type (read-only)
- Node ID (read-only, copyable)
- Parent ID (read-only)
- Children count (read-only)

**Why**
- Debuggable
- Export-safe
- Template-safe

## 2. Layout Panel (Editable)
**Maps to:** `node.transform`, `node.layout`

**Fields**
- Position: x, y
- Size: width, height
- Rotation (if supported)
- Opacity
- Z-index / order
- Auto-layout toggle (if parent supports it)

**Rules**
- Numbers only
- No percentages (v1)
- No responsive logic (v2)

## 3. Content Panel (Editable)
**Maps to:** `node.props.content`

**For Text nodes**
- Text content (string)
- Text alignment (basic)

**For Image nodes**
- Image source (URL or uploaded asset ref)
- Alt text (important for export + a11y)

**For Button nodes**
- Label text
- Variant (primary / secondary — semantic only)

**Rules**
- No inline styles
- No formatting toolbar
- Pure semantic content

## 4. Semantics Panel (Editable, Very Important)
**Maps to:** `node.props.semantic`

**Fields**
- Semantic Tag (dropdown)
  - div, section, header, footer
  - button, nav, main, article
- Role (ARIA role, optional)
- Label / description (string)

**Why**
- Powers static HTML
- Powers WordPress
- Powers accessibility
- Powers AI translation

This is v1 gold.

## 5. Motion Panel (Read-Only, Intent Only)
**Maps to:** MotionIR (projection only)

**Display only**
- Motion type (fade / slide / scale)
- Duration
- Easing
- Loop / autoplay (flags)

**Rules**
- Cannot edit values directly in v1
- Shows what the template or animation workspace defines

This avoids scope creep while keeping motion visible.

## 6. Export Preview Panel (Read-Only)
**Purpose:** Confidence and trust.

**Shows**
- Target semantic output:
  - HTML tag preview
  - WordPress tag preview
- Warnings (if any):
  - Missing semantic tag
  - Empty content
  - Unsupported node type

No buttons here. Buttons live in Translate / Export workspace, not inspector.

## What UIUX Inspector v1 Excludes (Explicit)
- Event handlers
- Click actions
- API bindings
- Styling systems
- Responsive breakpoints
- Conditional logic
- Animations editing

These belong to v2+ or other workspaces.

## How This Connects to Everything Else
**Templates**
- Inspector fields = template parameters

**AI**
- Inspector fields = safe prompt inputs

**Export**
- Inspector fields = deterministic output

**Marketplace**
- Inspector fields = editable template surface

## Implementation Scope (Realistic)
This is not a rewrite. You are mostly:
- Wiring existing inspectors together
- Adding 2–3 small panels
- Locking order and rules

This is 1–2 weeks max, not months.

## Outcome
Once UIUX Inspector v1 is complete:
- Users can design real layouts
- Templates make sense
- Export makes sense
- Translate makes sense
- Marketplace makes sense

Everything else becomes incremental.
