# Dropple WorldShell UI Spec

Status: Proposed  
Purpose: define the UI surface blueprint for a substrate-first Dropple shell before implementation.

## Core Law

> The substrate never changes. The grammar changes.

## Core Goal

Dropple should present one full-screen project world.

Everything else should:

- float
- appear by context
- or be summoned

Dropple should not present:

- stacked application headers
- permanent side panels
- duplicate canvases
- dashboard-era shell framing

## Core Layout

Full viewport:

```text
Full viewport
└── Spatial substrate / canvas owns 100%
    ├── Project Capsule: top-left
    ├── Command/Search/Share capsule: top-right
    ├── Grammar Tool Dock: left floating
    ├── Context Inspector: right floating, only when selected
    ├── Selection Action Bar: near selected object
    ├── Zoom/Depth controls: bottom-right
    ├── Universe/Map control: bottom-left
    └── Timeline: bottom floating, only when grammar needs time
```

## Surface Inventory

### Permanent Surfaces

Only these should be permanently visible in the default spatial shell:

- Project Capsule
- Grammar Tool Dock
- Zoom / Depth Controls

### Contextual Surfaces

These should appear only when context requires them:

- Command / Search / Share capsule
- Context Inspector
- Selection Action Bar
- Timeline
- Assistant surface
- Workflow guidance
- Universe / Map overview

## Surface Rules

### 1. Project Capsule

Position:

- top-left

Purpose:

- declare the owning project
- declare current intent
- declare current grammar

Contents:

- Dropple
- project name
- perspective + grammar label

Example:

```text
Dropple
Project Orion
Create > UI
```

Replaces:

- stacked headers
- perspective rows
- mode rows
- project hub labels
- workspace strip narration

Behavior:

- always visible
- compact
- does not consume a full-width layout band
- acts as identity, not as a dashboard

Owner:

- outer shell

### 2. Spatial Substrate / Canvas

Position:

- full viewport owner

Purpose:

- primary persistent work surface for spatial grammars

Rules:

- the canvas is not inside a panel
- the canvas is the screen
- no second visible canvas
- no large dead region around it
- no visible shell box that competes with it

Behavior:

- supports pan
- supports zoom
- supports focus
- supports selection
- supports grammar-driven overlays

Owner:

- shared spatial substrate

Initial implementation target:

- `WorkspaceCanvasRoot`

### 3. Grammar Tool Dock

Position:

- left floating

Purpose:

- expose active grammar tools

Behavior:

- always available
- compact by default
- may expand on hover or explicit action
- tool list changes by grammar

Examples:

`Create > UI`

- Frame
- Text
- Component
- Layout

`Build > Application`

- Flow
- API
- Data
- Logic

`Collaborate > Review`

- Comment
- Approve
- Discuss

Owner:

- grammar pack / capability injection

### 4. Command / Search / Share Capsule

Position:

- top-right

Purpose:

- global search
- quick command access
- collaboration / share access

Behavior:

- lightweight
- should not dominate shell hierarchy
- can collapse to icons if necessary

Owner:

- shell-level utility surface

### 5. Context Inspector

Position:

- right floating

Purpose:

- show contextual properties for the active object or active context

Rules:

- no selection = hidden
- selection = visible

Behavior:

- emerges when an object is selected
- recedes when selection clears
- content changes by grammar and selected object type

Owner:

- grammar-driven inspector injection

### 6. Selection Action Bar

Position:

- near selected object

Purpose:

- expose immediate actions without forcing travel to remote chrome

Behavior:

- appears only on selection
- anchored to object or selection bounds
- contents change by grammar and selection type

Owner:

- grammar action layer

### 7. Zoom / Depth Controls

Position:

- bottom-right

Purpose:

- control spatial zoom
- control depth/state transitions where applicable

Behavior:

- always visible
- small footprint
- should not consume a full layout strip

Owner:

- substrate navigation layer

### 8. Universe / Map Control

Position:

- bottom-left

Purpose:

- expose world overview, minimap, or zoomed-out project understanding

Rules:

- not a permanent dashboard panel
- not a large explanatory panel

Behavior:

- zoom/depth control
- minimap
- summonable world overview

Owner:

- substrate navigation layer

### 9. Timeline

Position:

- bottom floating

Purpose:

- expose time-native controls when grammar needs them

Rules:

- `UI / Graphic` = hidden by default
- `Motion / Video` = visible when active
- `Audio / Music` = timeline becomes primary substrate, not secondary chrome

Behavior:

- emerges only when grammar or object context requires time
- should not consume permanent space in spatial grammars when inactive

Owner:

- grammar-driven timeline surface

## Visibility Matrix

### Spatial Grammars

Default visible:

- Project Capsule
- Grammar Tool Dock
- Zoom / Depth Controls

Contextual:

- Inspector
- Selection Action Bar
- Universe / Map
- Assistant
- Workflow guidance
- Timeline only if motion context exists

### Time-First Grammars

Default visible:

- Project Capsule
- tool surface appropriate to grammar
- time substrate controls

Contextual:

- inspector
- assistant
- workflow guidance

Primary substrate:

- timeline

### Dual-Surface Grammars

Default visible:

- Project Capsule
- Grammar Tool Dock
- Zoom / Depth Controls
- timeline

Contextual:

- inspector
- selection actions
- assistant

Primary substrate model:

- coordinated canvas + timeline

## Ownership Model

### Shell Owns

- Project Capsule
- global utility capsule
- top-level shell composition

### Shared Substrate Owns

- primary spatial surface
- pan / zoom / focus behavior
- world continuity
- depth behavior

### Grammar Owns

- tool dock contents
- inspector contents
- overlays
- selection actions
- timeline activation
- grammar-specific behaviors

### Capability System Owns

- injected surfaces
- contextual panel availability
- assistant availability
- workflow surface availability

## Interaction Rules

### Selection

- selection must not require a permanent inspector
- selection creates local affordances:
  - selection action bar
  - inspector emergence

### Focus

- focus must feel like movement inside the same world
- not a route jump into another application

### Zoom

- zoom should express scale
- not mode switching

### Perspective Change

- changes why the user is here
- should not replace the world

### Grammar Change

- changes tools and behavior
- should not replace the substrate

## Empty State Rules

When nothing is selected:

- inspector hidden
- selection bar hidden

When no motion context exists:

- timeline hidden

When project is empty:

- substrate still owns the viewport
- shell should not fill emptiness with permanent support panels
- guidance should be lightweight and contextual

## Anti-Patterns

Do not introduce:

- duplicate canvases
- permanent empty inspectors
- permanent workflow rails
- permanent project summary panels
- shell-owned editor boxes that subordinate the substrate
- workspace-specific shell duplication
- application-style top chrome stacks

## Acceptance Criteria

The shell spec is valid when:

1. the substrate is clearly the primary surface
2. only minimal permanent shell remains
3. inspector is contextual
4. timeline is contextual except in time-first grammars
5. tool dock is grammar-driven
6. project identity remains visible without becoming a header stack
7. world overview is summonable, not a permanent panel
8. no second visible canvas exists in spatial grammars

## First Implementation Target

The first shell implementation should prove this model on:

- `Create > UI`

Using:

- one dominant `WorkspaceCanvasRoot`-based surface
- floating project capsule
- floating tool dock
- contextual inspector
- contextual timeline
- no duplicate world surface
- no permanent support-column ownership
