🦴 SKELETON_DEBUG_LAYER.md

Dropple Animation v2 — Debug & Visualization Layer

Status: Design-only
Scope: Read-only, derived-only visualization
Mutation: ❌ None
Authoring: ❌ None
Runtime truth: ❌ Not modified
Playback safe: ✅ Yes

1. Purpose

The Skeleton Debug Layer exists to make skeletons, bones, chains, and solver state visible and understandable during animation and playback.

This layer is:

Purely diagnostic

Derived from existing state

Non-interactive

Zero-risk

It prevents “black box” animation bugs by making skeletal structure and solver decisions explicit.

2. Layer Placement (Render Order)

From bottom → top:

Canvas surface

Motion trails / onion skin

Skeleton Debug Layer ← this document

Constraint visualizers (follow / pin / aim)

Live nodes

Selection, gizmos, UI overlays

Rules

Skeleton visuals must never block interaction

Skeleton visuals must never obscure selection UI

3. Rendering Primitives
3.1 Bones

Each bone is rendered as:

A line segment from parent joint → child joint

A joint circle at each endpoint

Bone color by state
State	Color	Style
Rest pose	#9CA3AF	solid
FK active	#3B82F6	solid
IK active	#10B981	solid
FK/IK blended	gradient (blue → green)	solid
Disabled	#9CA3AF	dashed, low opacity
3.2 Joints

Small filled circle

Radius scales slightly with zoom

Always centered on evaluated joint position

4. Optional Debug Overlays (toggles)
4.1 Bone Axes

When enabled:

Draw local X/Y axes at each joint

Axes rotate with bone orientation

Purpose:

Debug rotation math

Catch flipped transforms early

Default: OFF

4.2 Bone IDs

Small text label near joint

Only visible when:

Zoom tier ≥ detail

Skeleton Debug enabled

Never selectable. Never interactive.

5. Chains & Hierarchy
5.1 Chain Highlight

When a chain is selected (via UI or inspector):

Entire chain highlights

Gradient from root → effector

Used to understand:

Chain boundaries

Which bones are controlled together

5.2 Parenting Indicators (debug)

Optional arrows:

parent → child


Used to:

Detect broken parenting

Debug imported skeletons

Default: OFF

6. Constraint Visualization (Skeleton-specific)

These are additive to existing constraint visualizers.

6.1 Rotation Limits

If a bone has rotation limits:

Render arc wedge around joint

Min/max angles visible

Behavior:

Inside range → green

Exceeded → red flash (preview only)

6.2 IK Reach

For IK chains:

Draw reach circle centered at chain root

Radius = total bone length

If effector exceeds reach:

Circle becomes dashed red

This is diagnostic only — no solver mutation.

6.3 Pole / Bend Hint (future-ready)

Reserved visualization:

Dotted line indicating preferred bend plane

Inactive until IK v2.2+

7. Solver State Indicators

Near each chain root, render a small badge:

Badge	Meaning
FK	FK solver active
IK	IK solver active
B	FK/IK blended
⚠️	Solver clamped / unstable

This dramatically reduces debugging time.

8. Interaction Rules (Hard Constraints)

The Skeleton Debug Layer:

❌ Does not capture pointer events

❌ Does not affect selection

❌ Does not emit intents

❌ Does not write to stores

Required CSS:

pointer-events: none;

9. UI Controls (Inspector)
Section: Skeleton Debug

Checkboxes:

☑ Show skeleton

☐ Show bone axes

☐ Show bone names

☑ Show constraints

☐ Show solver state

Rules:

UI-only state

Not persisted

Safe during playback

Safe during scrubbing

10. Data Sources (No New Models)

Consumes only:

Skeleton registry

Derived animation state

Derived render nodes

Derived constraint state

No new evaluators.
No new runtime truth.

Conceptual pipeline:

evaluateAnimation
→ applyCharacterConstraints
→ applyAttachments
→ applySkeletonDebugOverlay (read-only)

11. Explicit Non-Goals

This layer does NOT:

Create bones

Modify bones

Solve IK

Apply constraints

Write keyframes

Affect export

It is pure visualization.

12. Why This Exists Before Skeleton Logic

This layer:

Makes FK/IK math debuggable

Prevents invisible solver bugs

Establishes visual contracts early

De-risks every future skeleton feature

If this layer is missing, skeleton v2 will be painful.

13. Lock Statement

Skeleton Debug Layer is a required diagnostic layer for Skeleton v2+.
It must remain derived-only and mutation-free.
