# Workspace Launch Context Spec

Status: Frozen interface draft  
Date: 2026-07-29  
Scope: Contract between Creative Session Resolution and Workspace Boot

## Purpose

This document defines the stable interface between:

- Creative Session Resolution
- Workspace Boot

Creative Session Resolution decides why a workspace is being opened.

Workspace Boot should receive that decision as explicit truth.

The workspace must not infer missing launch meaning from scattered route state
or partial UI memory.

## Core Rule

Every workspace launched through Creative Session Resolution must receive one
complete Workspace Launch Context object.

No subsystem should reconstruct:

- language
- category
- blueprint
- template
- grammar
- certification

after launch.

## Workspace Launch Authority Law

Workspace Launch Context is the sole authority for workspace session
initialization.

The Workspace Runtime must never derive:

- language
- category
- blueprint
- template
- grammar
- certification

from routes, marketplace state, component state, or UI memory after launch.

All such truth must already exist inside the Workspace Launch Context.

## Contract Shape

```ts
type WorkspaceLaunchContext = {
  version: 1;
  language: string | null;
  category: string | null;
  blueprint: {
    id: string | null;
    versionId: string | null;
  } | null;
  template: {
    id: string | null;
    versionId: string | null;
  } | null;
  grammar: string | null;
  certification: {
    blueprint: string | null;
    template: string | null;
  } | null;
};
```

This shape is intentionally minimal.

It defines session truth, not full catalog metadata.

### `version`

The launch-context contract version.

Initial value:

- `1`

Future additions should evolve through explicit contract versioning rather than
silent field drift.

## Field Meanings

### `language`

The resolved creative language for the session.

Examples:

- `uiux`
- `application`
- `graphic`
- `animation`

### `category`

The resolved blueprint category within the selected language.

Examples:

- `dashboard`
- `landing-page`
- `marketplace`
- `storyboard`

### `blueprint`

The structural package chosen for the session.

This identifies what will be installed or used as the structural starting point.

### `template`

The optional expressive package chosen for the session.

This identifies what visual or motion expression should be applied to the
session at boot.

### `grammar`

The authoring grammar the workspace should open in.

Initial values:

- `create`
- `blueprint-author`
- `template-author`

### `certification`

The trust state of the selected blueprint and template.

Initial values may include:

- `dropple-certified`
- `community`
- `experimental`
- `private`

## Required Guarantees

Workspace Launch Context must guarantee:

1. The workspace knows why it was opened.
2. The workspace knows what structural starting point was chosen.
3. The workspace knows what expressive starting point was chosen.
4. The workspace knows which grammar should govern editing.
5. The workspace knows the certification state of imported authoring assets.

## Resolution Sequence

Creative Session Resolution is complete only when the following sequence has
converged:

Start  
↓  
Language Selected  
↓  
Blueprint Category Selected  
↓  
Blueprint Selected  
↓  
Template Selected (optional)  
↓  
Grammar Selected  
↓  
Certification Resolved  
↓  
Workspace Launch Context Resolved  
↓  
Workspace Boot

## Workspace Responsibilities

Once Workspace Launch Context is received, the workspace may:

- configure the correct mode
- install or boot the selected blueprint
- install or activate the selected template
- expose grammar-specific tools and panels
- surface certification information

The workspace may not mutate launch truth silently.

If launch truth changes, it should be treated as a new resolved session or as an
explicit user action.

## Non-Goals

This contract does not define:

- catalog UI
- screen layout
- modal or wizard behavior
- how blueprint installation internally works
- how template activation internally works

It defines only the interface between session resolution and workspace launch.

## Example

```json
{
  "version": 1,
  "language": "uiux",
  "category": "dashboard",
  "blueprint": {
    "id": "bp.analytics-dashboard",
    "versionId": "bp.analytics-dashboard.v1"
  },
  "template": {
    "id": "tpl.enterprise-dark",
    "versionId": "tpl.enterprise-dark.v3"
  },
  "grammar": "create",
  "certification": {
    "blueprint": "dropple-certified",
    "template": "dropple-certified"
  }
}
```

## Final Rule

Home does not need to know how the workspace works.

The workspace does not need to know how Home works.

They communicate through one explicit Workspace Launch Context contract.
