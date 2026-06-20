# GROUPING_AND_MERGING_LAW

In Dropple, grouping is a structural relationship in the Project World, not a temporary editing convenience.

## Purpose

This document defines the constitutional distinction between Grouping and Merging in Dropple.

Although both operate on multiple artifacts, they belong to different architectural layers and serve fundamentally different purposes.

## Constitutional Law

Group belongs to Shared Interaction Authority.

Merge belongs to Mode Grammar.

This law is invariant across the platform.

## Group Artifact Law

Grouping creates a new structural artifact.

The group artifact owns a collection of child artifacts while preserving the identity of every child.

Example:

Before

Frame A
Frame B
Shape C

After

Group
├── Frame A
├── Frame B
└── Shape C

The Group becomes a first-class artifact.

## Group Responsibilities

A Group owns its own:

- Identity
- Selection
- History
- Motion
- Transform
- Layout
- Constraints
- Metadata
- Visibility
- Lock state
- Collaboration state (future)

The Group is not merely a wrapper for interaction convenience.

It is a real artifact within the Project World.

## Child Artifact Law

Children retain:

- Identity
- History
- Properties
- Motion
- Local transforms
- Metadata

Grouping never destroys child artifacts.

Children become descendants of the Group.

## Selection Law

After grouping:

`selection.ids`
`[groupId]`

`selection.primary`
`groupId`

The wrapper artifact becomes the primary selection.

Children are not automatically selected.

Selecting a grouped object later should always resolve to the wrapper artifact.

Entering child-edit mode must be an explicit user action.

Never accidental.

## Transform Law

Transformations applied to the Group affect the collection.

Examples:

- Move
- Rotate
- Resize
- Scale
- Opacity
- Motion

Transformations applied to a child affect only that child.

## Ungroup Law

Ungroup removes only the wrapper artifact.

Children:

- preserve identity
- preserve history
- preserve properties
- preserve local transforms

Ungroup is deterministic.

No child artifacts are recreated.

## Container Evolution Law

A Group is a container artifact.

Container artifacts may evolve into richer artifact types without changing the interaction model.

Possible evolution:

Group
↓
Layout Group
↓
Smart Group
↓
Component
↓
Interactive Component

This evolution must preserve:

- Selection
- Drag
- Resize
- Delete
- History
- Motion
- Context menu
- Inspector

No new interaction authority is introduced.

Only grammar becomes richer.

## Shared Interaction Authority

Grouping is inherited by every mode.

Examples:

- UIUX
- Graphic
- Document
- Animation
- Application
- Logic

Every mode uses the same grouping behavior.

No mode-specific grouping implementations.

## Merge Law

Merge is fundamentally different.

Merge creates a new domain artifact.

Example:

Rectangle
Circle
Triangle

↓

Boolean Shape

The merged artifact becomes the working artifact.

The original artifacts become lineage.

Undo restores the originals.

There is no generic "Unmerge" command.

## Grammar Ownership

Merge belongs to the active mode grammar.

Examples:

| Mode | Merge Meaning |
| --- | --- |
| Graphic | Boolean shape, compound path, vector merge |
| Document | Merge text/content |
| Audio | Bounce tracks |
| Video | Flatten/composite |
| Logic | Collapse graph into reusable node |
| Animation | Bake or combine animation data |
| UIUX | Generally unavailable |

Merge behavior is defined by the grammar.

Grouping behavior is defined by the platform.

## Constitutional Summary

Grouping

- Creates a structural artifact
- Preserves child identity
- Universal
- Shared Interaction Authority
- Reversible through Ungroup

Merging

- Creates a new grammar artifact
- Replaces the working artifact
- Grammar-specific
- Mode Authority
- Reversible only through History

## Why This Matters

This law does not only define today's grouping implementation.

It establishes a long-term architectural invariant.

It means that future artifact classes such as:

- Components
- Symbols
- Smart Containers
- Layout Systems
- Interactive Widgets
- Logic Blocks
- Animation Rigs

can inherit from the same Container Artifact model instead of inventing separate interaction behavior.
