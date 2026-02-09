🦴⏱️ Bone Keyframe Authoring v2.1 — Timeline Semantics

Goal: author bone motion in the timeline exactly like node animation, while preserving FK/IK rules, blending, and derived-only guarantees.

1. Core Rule

Bone animation is timeline animation — not a separate system.

Bones:

use the same timeline

use the same timebase

use the same preview / scrub / playback pipeline

are evaluated before character constraints & attachments

2. What Is Being Authored
Bone properties that can be keyed (v2.1)
FK properties (per bone)

rotation

translation.x

translation.y

scale.x

scale.y

IK-related properties (per chain)

ikWeight

ikTarget.x

ikTarget.y

pole.x (optional)

pole.y (optional)

No implicit properties. Everything must be explicit.

3. Where Bone Data Lives

Bone animation data lives inside the existing timeline, under a new namespace:

timeline.animations.bones = {
  clips,
  tracks,
  keyframes
}


This mirrors node animation exactly.

4. Track Addressing

Every bone track is fully qualified:

target: {
  type: 'bone',
  skeletonId,
  boneId,
  property
}


Every IK track:

target: {
  type: 'ik',
  skeletonId,
  chainId,
  property
}


No ambiguity. No global state.

5. FK Authoring Semantics
5.1 Default Behavior

Selecting a bone

Transforming it in the viewport

Emits bone FK keyframes

Never node keyframes

Node transforms remain derived.

5.2 FK vs Node Conflict Rule

If a node is bound to a bone:

Node transform UI is disabled

Bone transform UI is enabled

Tooltip explains why

This avoids double-authoring.

6. IK Authoring Semantics
6.1 IK Target Tracks

Moving an IK target authors:

ikTarget.x

ikTarget.y


in world space.

6.2 IK Weight Authoring

IK weight is animated via:

timeline track

numeric range [0,1]

easing supported

This enables smooth FK ↔ IK blending.

7. Timeline Scrubbing & Preview

Scrubbing:

samples bone tracks

solves FK

solves IK

blends

deforms nodes

applies character constraints

applies attachments

renders

Same pipeline as v1, just extended.

8. Holds, Stepping & Snapping

Bone tracks:

participate in frame stepping

participate in keyframe stepping

respect Hold vs Interpolate mode

appear in onion skin & motion trails

No special casing.

9. Multi-Selection Authoring

Allowed:

multiple bones selected

transform emits keys for each bone

shared time, independent tracks

Disallowed:

mixing node + bone selection

mixing bones from different skeletons

UI prevents invalid states.

10. Auto-Keyframe Rules (v2.1)

Auto-keyframe policies apply to bones:

autoKeyframe.bones = {
  rotation: true,
  translation: true,
  scale: false
}


Separate from node policies.

11. Failure & Safety Rules

If bone authoring fails:

no keys written

warning shown

state unchanged

If skeleton disabled:

bone tracks ignored

timeline still loads

no data loss

12. Migration & Compatibility
v1 Timelines

continue to work

ignore bone tracks

v2 Timelines

can mix node + bone tracks

must not bind the same node twice

13. What Is Explicitly NOT Allowed (v2.1)

❌ Bone tracks writing node layout
❌ Node tracks writing bones
❌ Implicit IK switching
❌ Solver-driven key creation
❌ Runtime mutation

Everything is explicit, authored, and reversible.

14. Why This Design Is Solid

This gives you:

professional-grade rig animation

predictable timeline behavior

clean layering with existing systems

zero architectural debt

And it sets you up cleanly for:
👉 Skeleton Editor UI
👉 Mesh skinning (v3)
👉 Physics-assisted rigs (v3+)
