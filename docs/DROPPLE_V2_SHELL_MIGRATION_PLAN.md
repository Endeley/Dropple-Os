# Dropple V2 Shell Migration Plan

Status: Proposed  
Purpose: define how Dropple moves from a panel-first application shell to a substrate-first Creative OS shell without changing the runtime or product constitutions.

## Authority

[`DROPPLE_WORLDSHELL_UI_SPEC.md`](./DROPPLE_WORLDSHELL_UI_SPEC.md) is the authoritative description of the target shell.

This document describes migration from the current shell to the WorldShell architecture.

If a conflict exists between this document and the WorldShell spec, the WorldShell spec wins.

## Core Premise

Dropple does not need a new runtime architecture.

Dropple does not need a new product model.

Dropple needs a new embodiment.

The central law is:

> The substrate never changes. The grammar changes.

Everything in this migration plan follows from that rule.

## Dropple V2 Convergence Principle

### Core Law

> The substrate never changes. The grammar changes.

### Foundational Model

Dropple is a Creative Operating System built around persistent project worlds.

- the project is the owning object
- the substrate is the persistent environment in which work occurs
- perspectives change intent
- grammars change behavior
- tools, inspectors, overlays, timelines, assistants, and workflows are contextual projections of grammar and intent

### Target Hierarchy

Preferred:

Project  
→ Perspective  
→ Grammar  
→ Substrate  
→ Contextual Surfaces

Rejected:

Project  
→ Workspace  
→ Editor  
→ Canvas

### Definitions

#### Project

The owning object.

All artifacts, workflows, relationships, collaboration, and publishing activity belong to a project.

#### Perspective

Answers:

> Why am I here?

Examples:

- Create
- Build
- Operate
- Collaborate
- Publish

Perspectives are intent lenses, not applications.

#### Grammar

Answers:

> How am I working?

Examples:

- UI
- Graphic
- Application
- Review
- Governance
- Audio
- Video
- Motion

Grammars determine:

- tools
- inspectors
- overlays
- shortcuts
- behaviors
- contextual assistance

#### Substrate

Answers:

> Where does work happen?

The substrate is the primary persistent surface.

Examples:

- spatial canvas
- timeline
- coordinated canvas + timeline

A world may expose only one primary substrate at a time.

#### Contextual Surfaces

Contextual surfaces emerge from grammar and intent.

Examples:

- tool docks
- inspectors
- overlays
- timelines
- assistants
- workflow guidance
- selection actions

They are projections, not structural boundaries.

### Convergence Rules

Future UI work should converge toward:

- one shared substrate per world class
- grammar-driven tool injection
- grammar-driven inspector injection
- grammar-driven overlay injection
- capability-driven surfaces
- contextual emergence and recession
- perspective as intent

Future UI work should move away from:

- duplicate canvases
- competing primary surfaces
- workspace-specific layout systems
- permanent inspector ownership
- permanent workflow ownership
- shell proliferation
- application-style boundaries

### Primary Design Filter

For every proposed surface ask:

1. Is this the substrate?
2. Is this grammar?
3. Is this a contextual projection?
4. Or is this another hidden workspace shell?

If it is another hidden workspace shell, it is likely moving away from the Creative OS vision.

### Long-Term Goal

Users should feel:

> I am still inside my project.
>
> I am working differently now.

Not:

> I opened another tool.
>
> I switched applications.

The world remains.

The grammar changes.

## Constitutional Context

### Runtime Constitution

Frozen.

Must remain unchanged:

- single canonical truth
- dispatcher as the only mutation gate
- pure reducers
- UI as projection only
- replay determinism
- perspectives must not become separate applications

Question answered:

> How does Dropple work?

### Product Constitution

Ratified, with minor refinement possible.

Defines:

- project
- universe
- artifact
- perspective
- continuity
- one project world
- many perspectives
- many grammars

Question answered:

> What is Dropple?

### UI Constitution

Proposed.

Defines:

- substrate
- grammar
- motion
- surfaces
- zoom
- context

Question answered:

> How should Dropple feel?

## Core UI Law

> The substrate never changes. The grammar changes.

This means:

- the world remains persistent
- the project remains the owning object
- perspectives remain intent lenses
- modes become grammar packs
- tools emerge from grammar
- inspectors emerge from context
- the universe emerges from scale

## Proposed UI Constitutional Laws

### Law 1: Substrate Owns The Screen

The primary visual object must always be the world.

Application chrome is secondary.

Users should feel:

> I am inside a project world.

Not:

> I am looking at an application interface.

### Law 2: Canvas First

For spatial grammars:

- the substrate owns the viewport
- shell floats above it
- no permanent panel may compete with it

### Law 3: Surfaces Emerge

Surfaces appear because context requires them.

They do not remain visible simply because the application can show them.

Examples:

- no selection -> inspector hidden
- selection -> inspector visible
- motion context -> timeline visible
- hover tool rail -> dock expands

### Law 4: Universe Is A Zoom Level

Universe, room, artifact, and editor are scale states of one world.

Not separate destinations.

### Law 5: Motion Explains Meaning

Motion communicates:

- scale
- focus
- relation
- travel

Motion is never decoration.

### Law 6: Tools Are Context, Not Structure

Tools emerge from active grammar.

Tools do not define product boundaries.

### Law 7: Workspaces Are Perspectives, Not Applications

Create, Build, Operate, Collaborate, and Publish must feel like perspectives inside one world.

Not separate products.

## Shell Migration Layers

## Layer 1: What Stays

These are constitutional and must survive.

### Project

Still the owning object.

Everything belongs to a project.

### Universe

Still exists.

But no longer as a permanent panel.

### Perspectives

Still exist:

- Create
- Build
- Operate
- Collaborate
- Publish

They become intent lenses, not application tabs.

### Modes

Still exist:

- UI
- Graphic
- Branding
- Document
- Animation
- Application
- Automation
- Review
- Knowledge
- Governance
- Audio
- Video

They become grammar packs, not workspace boundaries.

### Workflows

Still exist.

But stop living in permanent sidebars.

They become contextual guidance.

### Assistant

Still exists.

But becomes a contextual collaborator, not a permanent control center.

## Layer 2: What Collapses

These survive conceptually, but disappear as permanent UI.

### Current Project Hub

Today:

- permanent
- large
- top of screen

V2:

- floating
- compact
- top-left
- absorbed into Project Capsule

### Current Navigator

Today:

- permanent left panel

V2:

- search / navigate
- summoned
- shortcut-driven
- floating

### Workflow Panels

Today:

- always visible

V2:

- appear when relevant
- otherwise hidden

### Universe Dominance Block

Today:

- persistent explanatory block

V2:

- optional project overview
- invoked, not persistent

## Layer 3: What Floats

Always available, but never dominant.

### Project Capsule

Top-left floating identity object:

- Dropple
- Project name
- Perspective > Grammar

Permanent, but small.

### Tool Dock

Left-side floating dock.

- collapsed by default
- expands on hover or click
- grammar-driven

### Zoom Controls

Bottom-right.

- always visible
- small
- non-intrusive

### Universe Control

Bottom-left.

- always visible
- small
- used for depth/world navigation

### Collaboration Capsule

Top-right.

- people
- presence
- share
- search

## Layer 4: What Becomes Contextual

Appears only when needed.

### Inspector

- no selection -> hidden
- selection -> visible

### Timeline

Visible only for:

- motion
- animation
- video
- audio
- any time-first grammar

### Assistant

Visible when:

- requested
- task requires assistance
- active workflow needs support

### Workflow Guidance

Visible when:

- the user needs next-step context
- task guidance is materially useful

## Layer 5: What Becomes Scale

This is the largest conceptual change.

Current:

- universe
- room
- artifact
- editor

feel like separate places.

V2:

same world, different zoom depths.

### Zoom Out

Universe:

- all project geography
- all project structure

### Zoom In

Room:

- Create
- Build
- Operate
- Collaborate
- Publish

### Zoom Further

Artifact:

- active application
- active screen
- active review object

### Zoom Further

Editor:

- active work
- active detail manipulation

No separate universe panel.

No separate room page.

No separate editor page.

Just scale.

## Layer 6: What Becomes Grammar

This is where tools live.

Not in workspaces.

### Create > UI

Tools:

- Frame
- Text
- Layout
- Prototype

Inspector:

- Typography
- Spacing
- Constraints

### Build > Application

Tools:

- Flow
- API
- Logic
- Data
- Deploy

Inspector:

- Schema
- Endpoint
- Connection

### Collaborate > Review

Tools:

- Comment
- Review
- Approve
- Discuss

Inspector:

- Status
- Discussion
- History

Substrate unchanged.

Grammar changed.

## Mode Classes

### Spatial-first

These grammars live on the infinite world:

- UI
- Graphic
- Branding
- Icons
- Document
- Build
- Operate
- Collaborate
- Knowledge
- Review
- Animation

Primary surface:

- infinite substrate / canvas

Secondary surfaces:

- inspector
- tools
- timeline
- assistant

All contextual.

### Time-first

These grammars are naturally temporal:

- Audio
- Podcast
- Music

Primary surface:

- timeline

Not canvas-first.

### Dual-surface

These grammars require both:

- Video
- Motion Design
- Interactive Story
- Film

Primary surfaces:

- canvas
- timeline

Together.

## Minimum Viable Future Shell

If all permanent panels disappeared, the minimum shell needed to operate Dropple is:

1. substrate
2. project capsule
3. tool dock
4. context inspector
5. timeline when required
6. selection action bar
7. zoom/depth controls
8. collaboration/search capsule

Everything else is either contextual, summoned, or removable.

## U31 Split

`U31` should be treated as two internal layers.

### U31A: Shell Ownership

Focus:

- floating project capsule
- floating tool dock
- remove permanent competing panels
- make substrate own screen

### U31B: Surface Emergence Engine

Focus:

- inspector emergence
- assistant emergence
- workflow emergence
- overlay emergence

Reason:

Canvas ownership and surface emergence are different problems.

Substrate dominance can arrive earlier than full contextual-surface maturity.

## Build-First Rollout

The first spatial redesign should begin with:

> Build > Application

Reason:

- Build currently suffers most from dashboard inheritance
- if Build works under the doctrine, the doctrine is real
- Create is more forgiving because users already tolerate complexity in design tools

## Highest-Risk Failure Mode

The biggest implementation mistake is:

> current shell + prettier styling

The future Dropple is not:

- current Dropple
- plus glassmorphism
- plus floating cards

The future Dropple is:

- one substrate
- many grammars
- contextual surfaces
- persistent project world

## Pass / Fail Criteria

### Pass

A user enters `Build > Application` and experiences:

- one world
- one project
- one floating identity object
- one floating grammar dock
- one large work surface

They feel:

> I'm inside a project.

Not:

> I'm inside another page.

### Fail

If the redesign still feels like:

- panel-first UI
- dashboard with floating styling
- separate app-like rooms
- permanent chrome competing with work

then the shell migration has failed.

## Final Design Filter

Every UI element must answer:

> Is this part of the world, or is it helping me interact with the world?

If it is neither:

remove it.

## Final Summary

This migration plan does not replace Dropple's constitutions.

It preserves:

- runtime constitution
- product constitution

and defines how the UI constitution should be embodied.

The goal is not to remove the Creative OS model.

The goal is to stop trapping the Creative OS model inside permanent panels.

The world remains.

The grammar changes.
