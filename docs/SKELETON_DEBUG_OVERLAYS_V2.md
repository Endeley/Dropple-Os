🦴 Skeleton v2 — Debug Overlays & Visualization Contract

Goal: make bone systems observable, debuggable, and safe without mutating runtime truth or affecting rendering output.

These overlays are derived-only, like onion skin and motion trails.

1. Core Principle

Skeleton debug visuals are never part of the render tree.

They:

read evaluated bone + node state

draw overlays

do not affect layout, animation, or hit-testing

If debug is off → zero cost.

2. Debug Overlay Layers (Stack Order)

From back → front:

1. Motion Trails
2. Onion Skin
3. Skeleton Debug Layer   ← NEW
4. Live Nodes
5. Constraint Visualizers
6. UI / Handles


Skeleton debug sits between ghost frames and live nodes.

3. Visual Primitives
3.1 Bone Lines

Each bone renders as:

(start joint) ●───────● (end joint)


Color: light cyan (default)

Thickness: 1px (scaled by zoom tier)

Alpha: 0.6

Data source:

bone.worldStart
bone.worldEnd

3.2 Joint Points

Each joint renders as:

small filled circle

optional ID label on hover

JointDebug {
  id
  worldPosition
}


Color rules:

root joint → white

leaf joint → cyan

constrained joint → orange

3.3 Bone Direction Arrow

Optional arrow at bone midpoint:

shows forward direction

helps debug rotation flips

Enabled via toggle.

4. Rest Pose vs Animated Pose

When enabled:

Rest pose drawn as dashed gray

Animated pose drawn solid

---- rest
──── animated


This instantly reveals:

drift

incorrect deltas

rest-pose corruption

5. Angle & Length Labels (Optional)

Per bone (on hover or toggle):

rotation (degrees)

length

delta from rest

Example:

θ: +32°
ΔL: -4px


All labels are screen-space, not world-space.

6. IK Debug (Future-safe)

Even before IK is implemented, reserve visuals:

6.1 IK Target Marker

crosshair at target

label: IK Target

6.2 Solver Iteration Ghosts (future)

faint intermediate poses

capped to N iterations

These are no-ops until IK exists.

7. Selection & Highlighting Rules

Hover bone → highlight bone + joints

Select node → highlight bones influencing that node

Select bone → highlight affected nodes (future)

Selection is read-only.

8. Performance Guarantees

Debug layer subscribes only when visible

Uses memoized derived state

No per-frame allocations during playback

Automatically disabled during playback unless explicitly enabled

9. Failure Visuals (Critical)

If something is wrong, show it visually:

Condition	Visual
NaN transform	red bone
Zero-length bone	red dot
Missing parent	yellow bone
Cyclic hierarchy	flashing red

Never silently fail in debug mode.

10. Debug Controls (Inspector)

Skeleton Debug section:

☑ Show Bones

☑ Show Joints

☑ Show Rest Pose

☑ Show Angles

☑ Show Lengths

☑ Show IK Targets

☑ Freeze Debug (pause updates)

All toggles are UI-only state.

11. Hard Invariants

Debug overlays cannot write to runtime state

Debug overlays cannot emit intents

Debug overlays cannot affect selection

Debug overlays must tolerate partial data

Why This Matters

Before you ever write:

a solver

a bone editor

an IK chain

You already know:

what’s moving

why it’s wrong

where it breaks

This prevents months of blind debugging later.
