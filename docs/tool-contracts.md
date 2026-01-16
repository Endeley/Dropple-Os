Status: 🔒 FROZEN
Change policy: Additive only via new tools. Existing tools are immutable.

Dropple Tool Contracts

This document defines Dropple-only authoring tools that are foundational to the system’s identity.

These tools are not features.
They are contracts that shape architecture, UX, safety, and export behavior.

Global Tool Invariants (Applies to ALL Tools)

All tools defined here must obey the following rules:

Hard Laws

Tools never mutate runtime truth directly

Tools never bypass the dispatcher

Tools never write to persistence

Tools never affect replay or determinism

Tools never read DOM or UI state

Tools never generate IDs

Tools never execute animation

Architecture

Tools emit intent

Dispatcher translates intent → events

Reducers mutate truth

Preview systems render illusion

Export reads truth only

Violating any of these invalidates the tool.

Tool #1 — Animate Between States
Status

🔒 LOCKED

Purpose

Enable designers to create expressive motion without timelines or keyframes, by defining how one state flows into another.

User Mental Model

“When this state changes, it should feel like this.”

Users never think in:

Tracks

Curves

Keyframes

Time math

Architectural Definition

Authoring tool emits transition definitions

Transition is declarative metadata

Transition never triggers state change

Transition never owns animation execution

Storage

Stored in transitions.component or transitions.page

Indexed by (sourceStateId → targetStateId)

Execution

Executed only during state switches

Preview is illusion only

Truth commits after preview completes

Invariants

No timeline usage

No keyframes

Deterministic easing only

Replay-safe

Cancelable

Export-neutral by default

Tool #2 — Smart Motion Presets
Status

🔒 LOCKED

Purpose

Provide high-quality motion without manual setup.

User Mental Model

“Make this feel smooth / energetic / calm.”

Users select intent, not parameters.

Architectural Definition

Presets resolve into:

Transition properties

Duration

Easing

Resolution is pure and deterministic

Presets do not store state

Constraints

No custom curves

No runtime branching

No timeline ownership

Presets are replaceable, not editable

Relationship

Composes with:

Animate Between States

Interaction Motion

Never overrides explicit authoring

Tool #3 — Motion From Interaction

(hover → press → release)

Status

🔒 LOCKED

Purpose

Provide immediate tactile feedback for interactions without polluting design truth.

User Mental Model

“This feels responsive.”

Not:

“This is an animation”

“This has keyframes”

Architectural Definition

Motion is ephemeral

Exists only while interaction is active

Lives entirely in runtime illusion layer

Execution Rules

No reducers

No events

No persistence

No export

No history

No replay

Safety Guards

Blocked during replay (__isReplaying)

Cancelable on:

Pointer up

Blur

Undo

State change

Relationship
System	Behavior
Transitions	Coexists
Playback	Never overlaps
Timeline	Completely separate
Accessibility	Must respect reduced motion
Explicitly Non-Goals (Frozen)

The following are not allowed under any tool above:

Auto-creating keyframes

Writing timeline data implicitly

Exporting interaction motion

Hidden persistence

UI-driven state mutation

Side-effects during replay

If needed, these require new tools, not extensions.

Future Tool Slots (Not Defined Yet)

These names are reserved but not specified:

Motion From Hierarchy

Motion From Constraints

Adaptive Motion (device / context)

Expressive Physics Mode

They must live in separate contracts.

Final Lock Statement

This file is architecturally binding.

Any implementation:

Must conform to these contracts

Must not reinterpret intent

Must not weaken invariants

Violations are bugs, not design choices.
