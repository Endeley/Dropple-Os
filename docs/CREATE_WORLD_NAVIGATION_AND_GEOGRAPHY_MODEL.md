# Create World Navigation and Geography Model

## Purpose

This document freezes the smallest Create World ownership boundary proven by the current audit.

It does not extract code.
It does not redesign runtime authority.
It does not broaden Create World beyond what the repository already proves.

It exists to answer one question clearly:

`Who owns navigation and geography inside the shared Create World?`

This document derives from:

- [CREATE_WORLD_MODEL.md](./CREATE_WORLD_MODEL.md)
- [WORLD_AUTHORITY_AUDIT.md](./WORLD_AUTHORITY_AUDIT.md)
- [CONSTITUTIONAL_STACK_V1.md](./CONSTITUTIONAL_STACK_V1.md)

## Core Claim

Dropple already proves a shared world substrate.

The next ownership boundary is:

`Create World Navigation and Geography`

This boundary owns the shared spatial rules that determine:

- where home is
- what focus means
- how the world remembers prior work
- where the first artifact should appear
- how return-home behavior is resolved
- how viewport geography is derived before runtime applies it

This boundary is shared.
It must not remain UIUX-specific.

## Frozen Ownership

### Create World Owns

Create World Navigation and Geography owns:

- world home
- world origin
- focus targets
- return-home resolution
- viewport geography policy
- worked-world versus empty-world navigation state
- world memory for first remembered artifact
- first artifact placement policy
- artifact-neutral spatial rules for shared creation

These responsibilities are world responsibilities even when the current implementation lives in UIUX-adjacent files.

### Runtime Owns

Runtime continues to own:

- canonical viewport state
- canonical selection state
- lawful state mutation
- event application
- replayable truth

Create World may resolve a target viewport.
Runtime remains the only authority that applies it.

### Creative Language Owns

Creative Language continues to own:

- what an artifact means
- discipline vocabulary
- scenario semantics
- empty-world copy
- starter options
- creator-facing naming such as `Page`, `Dashboard`, or `Login`

Creative Language may ask Create World to go home or focus an artifact.
It does not define what home or focus structurally are.

### Product Expression Owns

Product Expression continues to own:

- how navigation and geography are revealed to the creator
- where return-home affordances appear
- whether home, focus, or minimap controls feel calm and understandable
- how empty-world guidance reduces uncertainty

Product Expression does not own the underlying navigation rules.

## Canonical Rules

### 1. Home Is A World Concept

`Home` is not a UIUX concept.
It is the canonical resting position of the shared Create World.

### 2. Focus Is A World Concept

`Focus` is not a language-specific camera trick.
It is the shared world rule for moving attention toward meaningful authored work.

### 3. A Worked World Remains Worked

If the creator previously authored work, world memory must preserve that fact.

This is not a UIUX onboarding rule.
It is a Create World rule.

### 4. First Artifact Placement Is Geography

The placement of the first authored artifact belongs to shared world geography.

Creative Language may decide what the first thing means.
Create World decides where it enters the world.

### 5. Runtime Applies; Create World Resolves

Create World may derive:

- home viewport
- focus viewport
- initial viewport

Runtime remains the only authority that mutates viewport truth.

## Current Evidence

The current repository already concentrates this ownership in one policy cluster:

- [runtime/workspaces/projectSubstrateNavigation.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/workspaces/projectSubstrateNavigation.js:43)

This file currently contains:

- UIUX-specific world gating
- history detection
- first remembered artifact resolution
- project home/origin resolution
- current focus resolution
- home and artifact viewport derivation
- home initialization rules
- first frame bounds

The file is evidence of the boundary, even though it is not yet correctly named.

Additional evidence:

- [ui/workspace/uiux/UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:303)
- [ui/workspace/uiux/UIUXToolRail.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXToolRail.jsx:98)

These files currently invoke return-home behavior, proving that UIUX still contains world-entry adapters that should eventually become Create World surfaces.

Runtime authority remains correctly separate:

- [core/events/reducers/viewportReducer.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/core/events/reducers/viewportReducer.js:9)
- [runtime/state/workspaceRuntime.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/runtime/state/workspaceRuntime.js:10)

## Non-Ownership

This boundary does not own:

- UIUX starter card semantics
- scenario provision
- inspector wording
- toolbar wording
- language dictionaries
- artifact interpretation
- runtime reducers
- installer behavior

## Extraction Anchor

When extraction begins, the first extraction should preserve this rule:

`Freeze Create World navigation and geography ownership first.`

Then:

`Move implementation toward the frozen owner without moving runtime truth or language semantics.`
