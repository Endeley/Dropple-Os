🦴➡️📦 Skeleton v2 — Bone → Node Deformation Contract

Goal: bones deform nodes predictably, without corrupting layout truth, animation, or camera math.

This contract defines what bones are allowed to change, how deformation is applied, and what is strictly forbidden.

1. Core Rule (Non-Negotiable)

Bones NEVER mutate runtime node truth.

They produce a derived deformation layer only.

runtime truth (nodes)
        ↓
animation evaluation
        ↓
bone deformation
        ↓
derived render nodes


Runtime state remains pristine.

2. What a Bone Can Affect

A bone may affect only these properties:

Allowed (Derived)

x

y

rotation

scaleX

scaleY

Conditionally Allowed

width, height
(only if explicitly enabled on the node)

Forbidden

❌ node identity
❌ layout anchoring model
❌ parent/child hierarchy
❌ camera / viewport
❌ selection state
❌ timeline data

3. Node Binding to Bones

Nodes do not auto-bind.

Explicit binding required
BoneBinding {
  boneId: string
  nodeId: string
  bindPose: {
    position: { x, y }
    rotation: number
    scale: { x, y }
  }
  influence: 0..1
}


Captured once at bind time

Immutable unless explicitly re-bound

4. Bind Pose Invariant

Bind pose is the reference frame for all deformation.

All deformation is delta-based:

finalNodeTransform =
  bindPose
+ boneDelta


Never absolute overrides.

5. Deformation Math (High Level)

For each bound node:

boneWorldTransform
÷ bindBoneWorldTransform
= boneDelta

nodeWorldTransform =
  apply(boneDelta, bindNodeTransform)


This ensures:

consistent deformation

no drift

reversible math

6. Multiple Bone Influences (v2 scope)
v2 Rule (Simple & Safe)

One bone per node

No blending

No weights > 1

Skinning comes later (v3).

If multiple bindings are detected:

first wins

dev warning emitted

7. Rotation Rules

Rotation is additive

Applied around node’s local origin (from bind pose)

No gimbal resolution in v2

node.rotation = bind.rotation + bone.delta.rotation

8. Scale Rules

Scale is:

multiplicative

relative to bind pose

node.scaleX = bind.scaleX * bone.delta.scaleX
node.scaleY = bind.scaleY * bone.delta.scaleY


Scale inheritance is opt-in per node.

9. Position Rules

Position deformation:

node.position =
  bind.position
+ rotate(bone.delta.translation, bind.rotation)


This keeps:

limbs attached

rotations coherent

offsets stable

10. Interaction with Existing Systems
Character Constraints

Applied after bone deformation

Bones never override character logic

Order:

animation → skeleton → character → attachments → render

Attachments

Attachments see post-bone positions

Attachments never feed back into skeleton

11. Failure Handling

If:

bone missing

bind pose missing

invalid math

Then:

node renders in bind pose

dev warning logged

animation continues

Never crash.

12. Debug Guarantees

Every derived node can report:

{
  source: 'skeleton',
  boneId,
  bindPose,
  delta
}


Used by:

onion skin

motion trails

debug overlays

13. What This Enables (Without More Work)

With this contract alone, you already get:

rigid limb animation

head / arm / prop control

character posing

FK/IK blending compatibility

timeline-driven rigs

All without:

mesh skinning

vertex deformation

shader hacks

14. Explicit Non-Goals (v2)

❌ mesh skinning
❌ weighted bones
❌ per-vertex deformation
❌ constraints feeding back into bones
❌ physics

Those belong to Skeleton v3.
