# W1 — WorldShellV1 Foundation

Status: Proposed  
Type: Foundation Execution Lane  
Purpose: prove the WorldShell doctrine through implementation.

This lane does not redesign Dropple.

This lane does not expand product scope.

This lane does not introduce new grammars, perspectives, workflows, or systems.

Its only purpose is to prove that the substrate can become the primary visual and interaction surface of Dropple.

## Success Question

> Open Dropple.
>
> The first thing you notice is the world.
>
> Not the UI.

## W1.1 — Project Capsule

### Goal

Provide a single persistent orientation anchor.

### Responsibilities

- project identity
- active perspective
- active grammar

### Example

```text
Dropple
Fleet OS
Create > UI
```

### Acceptance

- visible at all times
- compact by default
- does not compete with the substrate
- project identity obvious within seconds

## W1.2 — Tool Dock

### Goal

Provide tools without consuming layout ownership.

### Responsibilities

- tool access
- grammar-specific actions

### Acceptance

- floating
- collapsed by default
- no permanent rail
- substrate remains dominant

## W1.3 — WorkspaceCanvasRoot Takeover

### Goal

Make `WorkspaceCanvasRoot` the visible owner of `Create > UI`.

### Constitutional Rule

> The substrate owns the viewport.

### Acceptance

- one visible canvas
- canvas owns the viewport
- no nested editor feeling
- no competing surface

## W1.4 — Selection-Driven Inspector

### Goal

Make context emerge only when required.

### Rules

No selection → no inspector

Selection → inspector appears

### Acceptance

- no permanent inspector column
- empty state maximizes substrate visibility

## W1.5 — Zoom / Depth Controls

### Goal

Provide navigation without shell dominance.

### Acceptance

- bottom-right placement
- lightweight
- always available
- never competes with the substrate

## Explicitly Out Of Scope

- Universe Continuum
- Grammar Pack System
- Build
- Collaborate
- Publish
- Operate
- Timeline
- Assistant
- Workflow Guidance
- Review System

If implementation starts pulling any of those in, `W1` is failing scope discipline.

## Completion Criteria

All five slices are complete.

And the following statement is true:

> Open Dropple.
>
> The first thing you notice is the world.
>
> Not the UI.
