🧠 Skeleton v3 — Deformation Modes (Math Contract)

Goal: define how a bone influences a node, in a way that is
deterministic, composable, and debuggable.

0. Core Rule (Non-Negotiable)

Bones never write directly to node state.
They produce influences, which are blended and then applied.

This keeps:

animation reversible

debugging sane

constraints composable

1. Deformation Evaluation Order

For a node N at time t:

Node base layout from animation timeline

Character constraints (v1.x)

Bone deformation (this step)

Attachments

Render

Bone deformation never sees:

camera

viewport

screen space

World space only.

2. Canonical Bone Influence Output

Each bone produces a BoneInfluence per node:

BoneInfluence {
  translate: { x, y }
  rotate: number          // radians
  scale: { x, y }
}


If a bone has no effect on a node → zeroed influence.

3. Deformation Modes (Per Node × Bone)

Each NodeBoneWeight has a mode:

mode: 'rigid' | 'bend' | 'stretch' | 'squash'


Default: rigid

4. Mode Definitions (Math-Level)
4.1 Rigid (Default)

Node follows bone rotation + translation, no distortion.

translate = bone.deltaPosition * weight
rotate    = bone.deltaRotation * weight
scale     = { x: 0, y: 0 }


Use cases:

limbs

props

mechanical parts

4.2 Bend

Node rotates more near the bone pivot, less near the far edge.

Let:

p = node center

b0 = bone start

b1 = bone end

d = distance(p, b0) / length(bone)

bendFactor = clamp(1 - d)

rotate = bone.deltaRotation * bendFactor * weight
translate = small correction (optional)


No scaling by default.

Use cases:

arms

tails

spines

4.3 Stretch

Node stretches along the bone axis.

axis = normalize(bone.direction)
stretchAmount = bone.deltaLength / bone.restLength

scale.x += axis.x * stretchAmount * weight
scale.y += axis.y * stretchAmount * weight


Rotation optional (usually off).

Use cases:

cartoon limbs

elastic motion

4.4 Squash

Volume-preserving stretch.

stretch = stretchAmount * weight
scaleAlongAxis += stretch
scalePerpAxis -= stretch * squashRatio


Where:

squashRatio default = 0.5


Use cases:

cartoon body

impact motion

5. Blending Multiple Bones

For node N with multiple influences:

Translation
T = Σ influence.translate

Rotation
R = Σ influence.rotate

Scale
S = {
  x: 1 + Σ influence.scale.x,
  y: 1 + Σ influence.scale.y
}


Then applied in this order:

layout
→ translate
→ rotate (around node center)
→ scale (around node center)

6. Weight Interaction Rules

Weights are applied per influence

Locked weights bypass normalization

Final deformation is clamped to safety limits:

maxRotation = ±π
minScale = 0.1
maxScale = 10


If exceeded → dev warning, not crash.

7. Rest Pose Reference (Critical)

All deltas are computed relative to rest pose:

deltaRotation = bone.rotation(t) - bone.rotation(rest)
deltaLength   = bone.length(t) - bone.length(rest)


Never accumulate deltas frame-to-frame.

8. Debug Guarantees

For any node at any frame, you can inspect:

per-bone contribution

per-mode contribution

final blended transform

rest pose comparison

If a node breaks, you can answer:

“Which bone, which mode, which weight?”

9. Explicitly NOT Included (Yet)

❌ Muscle simulation
❌ Physics
❌ Collision-aware deformation
❌ Mesh skinning

Those come after this math layer is proven.

10. Why This Works for Dropple

Works with rectangular nodes

Integrates with timeline keyframes

Compatible with:

attachments

characters

constraints

Enables cartoon animation without meshes

This is exactly the right abstraction level.
