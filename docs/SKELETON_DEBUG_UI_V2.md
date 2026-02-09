🦴🪛 Skeleton Debug UI — Overlays & Inspector (Design Spec)

Goal: make skeleton behavior visible, explainable, and trustable at all times.

This UI is read-only, derived-only, and never affects runtime truth.

1. Core Debug UI Principles

Nothing is hidden

Nothing is editable here

Every visual has a reason

Failure is obvious, not silent

Debug UI can be turned off instantly

2. Where Debug UI Lives
2.1 Layers
[ Camera ]
  ├─ Skeleton Debug Layer   ← new
  ├─ Constraint Visualizers
  ├─ Motion Trails
  ├─ Onion Skin
  ├─ Live Nodes


Always rendered behind nodes

Pointer-events: none

Zero interaction capture

3. Skeleton Debug Overlay (Canvas)
3.1 Bones

Rendered as lines

Joint → Joint

Color-coded by state

State	Style
Valid	solid white
FK	solid blue
IK	solid purple
Blended	gradient blue → purple
Invalid	red dashed
Inactive	gray dashed
3.2 Joints

Small circles

Centered at joint position

Joint State	Style
Normal	filled
Root	double ring
Selected	highlighted
Invalid	hollow red
3.3 IK Targets

Crosshair marker

Optional dashed line from end-effector

State	Style
Reachable	solid
Unreachable	red
Blended	semi-transparent
3.4 Pole Vectors (if present)

Thin dashed line

From mid-joint to pole point

Hidden if unused

4. Failure Visualization Rules

If anything fails:

Bone turns red

Joint marker shows ⚠️

Dashed fallback pose shown

No animation stops

Never blink, never disappear silently

5. Skeleton Debug Inspector Panel

Lives inside Animation Inspector, collapsible.

5.1 Skeleton Summary (Top)
Skeleton: Active
Character: Hero_01
Bones: 14
Chains: 2
Status: ⚠️ 1 warning


If disabled:

Skeleton: Disabled
Reason: version mismatch

5.2 Bone List

One row per bone:

▶ Arm_L
  Mode: FK → IK (weight: 0.6)
  Parent: Spine_02
  Bound Node: hand_L
  Status: OK


If failed:

▶ Leg_R
  Status: ❌ IK failed (unreachable)


Expandable, read-only.

5.3 Chain Inspector

Per IK chain:

▶ Chain: Arm_L
  Root: Shoulder_L
  End: Hand_L
  IK Weight: 0.75
  Converged: true
  Iterations: 6


If failed:

Converged: false
Fallback: FK

5.4 Bind Pose Inspector

For selected bone or node:

Bind Pose
  Position: (x, y)
  Rotation: θ
  Scale: (1,1)


Delta shown live:

Delta
  ΔPos
  ΔRot
  ΔScale

6. Selection Behavior
User Selects	Debug UI Response
Node	highlight bound bone
Bone	highlight node
Chain	highlight entire chain
Character	show all bones

No selection mutation.

7. Timeline Interaction

Scrubbing updates debug UI live

Onion skin + motion trails include skeleton deformation

Hold mode respected

Playback hides debug UI by default (toggleable)

8. Toggles & Controls (Top Right)
☑ Show Skeleton
☑ Show IK Targets
☑ Show Bind Poses
☑ Show Failures Only
☐ Show During Playback


All UI-only flags.

9. Debug Introspection Contract (UI-facing)

The inspector consumes:

getSkeletonDebug(characterId)


No direct registry access.

10. Performance Guarantees

Debug UI runs only when visible

No layout thrash

No solver re-runs

No mutation

11. What This Enables Immediately

Even before skeleton implementation, this UI:

Defines expectations

Guides math correctness

Prevents black-box solvers

Makes future bugs trivial to diagnose

12. Explicit Non-Goals

❌ Editing bones here
❌ Keyframing here
❌ Creating skeletons here
❌ Fixing failures automatically

This is observation only.

What You’ve Achieved (Big Picture)

At this point, you have:

Animation v1 locked

Character system mature

Constraints visualized

Onion skin + motion trails

Skeleton v2 fully specified

Debug UI designed before code

This is exactly how large animation systems stay sane.
