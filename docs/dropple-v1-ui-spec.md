# Dropple v1 — Workspace-by-Workspace UI Spec

## Global UI Architecture (Applies to All Workspaces)
- `WorkspaceShell.jsx` → shared layout
- TopBar (file, undo, export)
- Left Panel → tools / layers
- Center → canvas / preview
- Right Panel → inspector / properties
- `ModeLoader` → switches workspace behavior
- No new shell architecture needed; finish existing system

## 1. UIUX Workspace (FLAGSHIP — FULL)
**Status:** Full authoring (v1 complete target)  
**Purpose:** Design real UI layouts that export to static HTML, React, WordPress, templates/marketplace

**UI Surface**
- Canvas (strong)
- Left Panel: Frames, Text, Image, Button, Containers
- Right Panel (Inspector): Layout (position, size, auto-layout), Content (text, image src), Semantics (role, tag), Motion (read-only intent)
- Bottom: Timeline (read-only in v1)

**Authoring Depth:** Full

**v1 Exclusions**
- No runtime JS
- No event handlers
- No backend wiring

## 2. Graphic Workspace (LIMITED AUTHORING)
**Status:** Yes for v1, constrained  
**Purpose:** Static graphic composition (simple Canva-like)

**UI Surface**
- Canvas (same engine)
- Left Panel: Shapes, Text, Image
- Right Panel: Size/position, Fill/stroke (basic), Image replace
- No timeline

**Authoring Depth:** Limited

**v1 Exclusions**
- No animation timeline
- No background removal (v1.1 AI)
- No effects engine

## 3. Animation Workspace (TEMPLATE-FIRST)
**Status:** Exists but not full authoring  
**Purpose:** Edit motion templates, not create complex motion from scratch

**UI Surface**
- Canvas (preview)
- Timeline (enabled but constrained)
- Right Panel: Motion intensity, speed, easing presets
- No node creation

**Authoring Depth:** Template-driven only

**v1 Exclusions**
- No rigging
- No physics
- No audio sync

## 4. Branding Workspace (TEMPLATE-FIRST)
**Purpose:** Brand kits and marketing assets

**UI Surface**
- Template browser
- Canvas preview
- Inspector: Color tokens, font swap, logo replace

**Authoring Depth:** Template-only

**v1 Exclusions**
- No brand system engine
- No rule enforcement

## 5. Icons Workspace (LIMITED)
**Purpose:** Simple vector/icon customization

**UI Surface**
- Canvas (SVG-based)
- Inspector: Size, color, stroke
- No timeline

**Authoring Depth:** Limited

**v1 Exclusions**
- No bezier editor
- No path boolean ops

## 6. Document Workspace (LIMITED)
**Purpose:** Static documents (certificates, reports)

**UI Surface**
- Canvas (page-based)
- Inspector: Text, layout, semantics
- Export later (PDF v2)

**Authoring Depth:** Limited

## 7. Translate Workspace (UTILITY — NO CANVAS)
**Status:** Ready  
**Purpose:** Run translation pipelines

**UI Surface**
- No canvas
- Panel actions: Generate Pseudo-Code, Generate React, Export Static HTML, Export WordPress
- Output preview (read-only)

**Authoring Depth:** Utility only

## 8. Dev Workspace (UTILITY)
**Purpose:** Internal debugging & inspection

**UI Surface**
- Logs
- State viewer
- DroppleSpec preview

**v1 Status:** Explicitly deferred

## Out of Scope for v1 (Explicitly Deferred)
- Video (full editor)
- Podcast / audio DAW
- Material / shader editor
- AI autonomous editing

**Deferred until after:** TemplateSpec, Marketplace, Monetization, Performance hardening

## Dropple v1 Ships With
- One fully capable authoring workspace (UIUX)
- Multiple template-driven creative surfaces
- Export + Translate pipelines
- Marketplace-ready templates
- Clean, extensible architecture
