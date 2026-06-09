# WorldShell V1 Layout Sketch

Status: Proposed  
Purpose: remove ambiguity around placement, hierarchy, emergence, ownership, and visual priority before `WorldShellV1` implementation begins.

This document is the final design artifact before implementation.

If a conflict exists between visual implementation and this layout sketch, this layout sketch wins.

## Visual Priority Order

`WorldShellV1` is governed by the following visual hierarchy:

1. Substrate
2. Project Capsule
3. Tool Dock

Everything else is subordinate.

The user should see the world before they see the interface.

## Viewport Ownership

The substrate owns the viewport.

The substrate is not inside a panel.

The substrate is not inside an editor frame.

The substrate is the environment.

Viewport:

```text
┌──────────────────────────────────────────────┐
│                                              │
│ Project Capsule                              │
│                                              │
│                                              │
│                                              │
│                                              │
│            Shared Substrate                  │
│          (WorkspaceCanvasRoot)               │
│                                              │
│                                              │
│                                              │
│                                              │
│                                Zoom Controls │
└──────────────────────────────────────────────┘
```

## Project Capsule

Position:

- top-left

Purpose:

- project orientation

Contents:

- Dropple
- project name
- perspective > grammar

Example:

```text
Dropple
Fleet OS
Create > UI
```

Behavior:

- always visible
- always reachable
- never dominates the viewport

States:

- compact
- expanded

Default:

- compact

## Tool Dock

Position:

- left edge
- vertically centered

Purpose:

- grammar tools

Behavior:

- collapsed by default

Expand on:

- hover
- click

Contents depend on grammar.

Example:

`Create > UI`

- Frame
- Text
- Component
- Layout

Rules:

- the dock never owns layout width
- the substrate remains visible beneath it

## Substrate

Owner:

- `WorkspaceCanvasRoot`

Position:

- full viewport

Purpose:

- primary work surface

Rules:

- pan
- zoom
- select
- focus

The substrate remains constant.

Only grammar changes.

## Inspector

Position:

- right edge

Default State:

- hidden

Visibility Rule:

- selection exists -> visible
- no selection -> hidden

Purpose:

- context-specific editing

Rule:

- the inspector never occupies permanent screen real estate

## Selection Action Bar

Position:

- near selection

Purpose:

- immediate actions

Examples:

- Align
- Group
- Component
- Duplicate

Rules:

- appears only when useful
- anchored to context
- not anchored to screen chrome

## Zoom / Depth Controls

Position:

- bottom-right

Purpose:

- world navigation

Functions:

- zoom in
- zoom out
- fit
- center
- world depth access

Behavior:

- always available
- visually lightweight

## Universe Control

Position:

- bottom-left

Purpose:

- world awareness

Rules:

- not a dashboard
- not a panel
- not a permanent summary surface

Universe is accessed through scale and navigation.

Universe remains subordinate to the active substrate.

## Timeline

`WorldShellV1` Default:

- hidden

`Create > UI`:

- hidden

Visibility Rule:

- only appears when grammar requires temporal interaction

Future examples:

- Motion
- Video
- Audio

Timeline is contextual.

Not permanent.

## Emergence Rules

### Inspector

- selection -> appear
- deselection -> disappear

### Timeline

- temporal grammar -> appear
- non-temporal grammar -> disappear

### Selection Bar

- selection -> appear
- no selection -> disappear

### Assistant

- request -> appear
- idle -> recede

### Workflow Guidance

- need detected -> appear
- need resolved -> recede

## Empty State

### New Project

The user should see:

- Project Capsule
- Tool Dock
- Substrate

Nothing else.

Do not show:

- onboarding dashboard
- setup panels
- summary cards
- workflow blocks

The world is primary.

## WorldShellV1 Frozen Scope

Included:

- `WorkspaceCanvasRoot`
- Project Capsule
- Tool Dock
- Zoom Controls
- selection-driven Inspector

Grammar:

- `Create > UI`

Not Included:

- Build
- Collaborate
- Publish
- Operate
- Universe Continuum
- Grammar Pack System
- Timeline System
- Assistant System

## Success Question

`WorldShellV1` succeeds if a first-time user immediately understands:

- there is one project
- there is one world
- there is one place to work
- the world owns the screen

At that point, the question stops being:

> What should Dropple be?

And becomes:

> Can we make the world own the screen?
