# WorldShell V1 Design

Status: Proposed  
Purpose: define how standing inside Dropple should feel before implementing `WorldShellV1`.

## 1. Design Intent

Dropple should feel like entering a persistent project world.

The substrate is the primary object.

The project is the anchor.

Tools are available but never dominant.

Context appears when needed and recedes when it is not.

The user should always feel inside the same world, even when changing perspective or grammar.

### Emotional Target

Dropple should feel:

- persistent
- spatial
- creative
- capable
- calm
- focused

Dropple should not feel like:

- a dashboard
- an admin panel
- a toolbox
- a workspace manager
- a software configuration surface

The guiding sentence is:

> I am standing inside my project.

Not:

> I am configuring software.

## 2. First Impression

When a user opens Dropple for the first time, the first thing they should perceive is:

- the world
- the project anchor
- the current way of working

They should not first perceive:

- navigation rows
- control chrome
- tabs
- stacked summaries
- inspector emptiness

### First Attention Rule

The largest visual object should be the substrate.

The second most important object should be the project capsule.

The third most important object should be the active work on the substrate.

Everything else should read as support.

### First-Run Emotional Read

The user should feel:

- there is a project here
- this world belongs to that project
- I can work here immediately
- the interface is helping me, not asking me to configure it

## 3. Substrate Design

The substrate is the heart of the shell.

For `WorldShellV1`, the substrate should be a spatial world built on the shared spatial canvas.

### Visual Role

The substrate:

- owns the viewport
- defines the atmosphere
- carries the work
- hosts all contextual surfaces

It is not:

- a panel inside a page
- a subordinate editor box
- a secondary region under summary chrome

### Background Direction

For `WorldShellV1`, the substrate should feel:

- calm
- legible
- deep enough to imply world space
- neutral enough to support many grammars later

Recommended direction:

- soft dark world
- subtle atmospheric depth
- restrained grid
- minimal noise

Not:

- flat dashboard white
- aggressively decorative gradients
- ornamental motion-heavy background

### Grid Behavior

The grid should support spatial reasoning, not dominate the substrate.

Rules:

- visible while authoring
- visually restrained
- fade in emphasis as content becomes primary
- scale appropriately with zoom
- avoid looking like engineering paper unless grammar requires that feel

### Empty World

An empty project should feel like:

- an available world
- a prepared surface
- a place where work can begin

Not:

- an empty editor
- a broken state
- a blank admin screen

The empty state should imply:

- possibility
- continuity
- readiness

## 4. Project Capsule

The project capsule is the anchor object of the shell.

### Position

- top-left

### Purpose

It answers:

- what system am I in
- what project owns this world
- what perspective and grammar are active

### Contents

`Dropple`  
`Project Name`  
`Perspective > Grammar`

Example:

```text
Dropple
Fleet OS
Create > UI
```

### Behavior

- always visible
- compact
- no full-width header band
- no duplicate supporting rows
- may expand on explicit action
- should never become a dashboard block

### Interaction

Collapsed state:

- icon / product name
- project name
- perspective > grammar

Expanded state:

- lightweight project actions
- not heavy project metadata

### Design Intent

This should feel like:

- a world anchor
- a navigation compass

Not:

- an app header

## 5. Tool Dock

The tool dock expresses grammar.

### Position

- left floating

### Purpose

- expose the active way of working
- remain reachable without dominating the screen

### Shape

Recommended:

- vertical dock
- compact icon-first presentation

### Visibility

- always available in spatial grammars
- visually secondary to the substrate

### Expansion

Recommended behavior:

- collapsed icons by default
- expand on hover or explicit click

### Grammar Embodiment

The dock should visibly change with grammar.

It should communicate:

- I am still in the same world
- I am working differently now

Not:

- I opened another application

## 6. Selection Behavior

Selection is one of the most important interaction states.

When something is selected, the world should respond clearly and locally.

### Selection Should Trigger

- visible selection bounds
- local emphasis
- selection action bar
- inspector emergence

### Selection Should Not Trigger

- a structural shell change
- major layout shifts
- a permanent side panel if no useful context exists

### Desired Feeling

Selection should feel:

- precise
- immediate
- grounded in the world

Not:

- bureaucratic
- panel-driven

## 7. Inspector Behavior

The inspector is contextual, not structural.

### Position

- right floating

### Rule

No selection:

- no inspector

Selection:

- inspector appears

Deselection:

- inspector recedes

### Behavior

- should feel attached to active context
- should emerge cleanly
- should not consume structural layout width in empty states

### Width

It should be wide enough for structured controls, but narrow enough that the substrate remains dominant.

### Motion

Inspector emergence should communicate:

- focus
- local context

Not:

- application mode change

## 8. Universe And Depth

Universe is not a panel.

Universe is a scale state of the world.

### Design Rule

The user should feel that:

- room
- artifact
- editor
- project world

are all part of the same environment at different depths.

### Universe Access

Recommended for `WorldShellV1`:

- bottom-left map / universe control
- lightweight world overview
- summonable, not permanent

### World Travel

Depth change should feel like:

- zoom
- travel
- focus shift

Not:

- route jump
- app switch
- opening another workspace

## 9. Motion Language

Motion exists to explain meaning.

### Motion Must Communicate

- focus
- depth
- continuity
- relationship
- emergence
- recession

### Motion Must Never Be

- decoration
- chrome flourish
- empty delight without meaning

### Key Motion Behaviors

Inspector:

- slides or fades in from context

Timeline:

- rises from below when time context becomes active

Universe / depth:

- zoom communicates scale change

Perspective change:

- should preserve world continuity

Grammar change:

- should preserve substrate continuity while changing tools and behavior

## 10. Grammar Embodiment: Create > UI

`WorldShellV1` should embody exactly one grammar first:

- `Create > UI`

### It Should Feel Like

- design
- composition
- creation
- visual authorship

### It Should Not Feel Like

- setup
- system administration
- workflow configuration
- template bureaucracy

### Tool Expression

The tool dock should make clear that the user is in a UI authoring grammar.

Examples:

- Frame
- Text
- Component
- Layout

### Inspector Expression

When selection exists, the inspector should feel like:

- object properties
- layout behavior
- visual adjustment

Not:

- generic metadata

## 11. Empty States

Empty states must preserve the dignity of the world.

### No Selection

- no inspector
- no unnecessary status panels
- no permanent placeholder chrome

### No Motion Context

- no timeline

### New Project

- world remains primary
- guidance is lightweight
- the project still feels real

The shell should not fill emptiness with:

- permanent workflow panels
- permanent assistant panels
- large explanatory cards

## 12. Responsive Behavior

WorldShell must preserve substrate dominance across screen sizes.

### Desktop

- full floating shell model
- strong world dominance

### Narrower screens

- persistent surfaces compress first
- contextual surfaces collapse or summon
- substrate must remain primary

### Responsive Rule

The shell may simplify, but it may not revert to stacked dashboard framing.

## 13. WorldShellV1 Freeze

The first implementation target is intentionally small.

### WorldShellV1 Includes

- `WorkspaceCanvasRoot`
- Project Capsule
- Tool Dock
- Context Inspector
- Zoom Controls

### Active Grammar

- `Create > UI`

### WorldShellV1 Does Not Include

- Build
- Operate
- Publish
- Collaborate
- universe zoom continuum
- full grammar system
- timeline-first worlds
- dual-surface worlds

### Purpose

Prove:

- one project
- one world
- one substrate
- one grammar
- contextual surfaces

Before broader shell migration begins.

## 14. Success Criteria

`WorldShellV1` is successful when a user can open Dropple and immediately feel:

- there is one world
- this world belongs to a project
- the canvas is the primary place of work
- the current grammar is clear
- tools are available but not dominant
- context appears when needed and recedes when it is not

The desired feeling is:

> I am still inside my project.
>
> I am working differently now.
