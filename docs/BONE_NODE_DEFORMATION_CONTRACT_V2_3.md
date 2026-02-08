🦴➡️🧱 Bone → Node Deformation Contract (v2.3)

Goal: define how solved bone transforms deform nodes safely and predictably
Scope: inputs, mapping rules, invariants, failure handling
Out of scope: skinning, weights UI, mesh deformation

0. Prime Rule

Bones deform nodes. Bones never become nodes.

Nodes remain:

layout-owned

animatable

serializable

Bones only influence nodes during derived render.

1. When Deformation Runs (Reaffirmed)

Per frame, per character:

1. Node animation (v1)
2. Character constraints
3. Attachments
4. Skeleton solve (FK / IK)
5. Bone → Node deformation   ← HERE
6. Debug / onion / trails
7. Render


Deformation is:

late

derived-only

non-authoritative

2. Inputs to Deformation
2.1 Required Inputs
DeformationInput {
  nodes: Record<NodeId, Node>
  skeleton: Skeleton
  boneTransforms: Record<BoneId, BoneTransform>
  bindings: BoneBinding[]
}


All inputs must already be:

finite

validated

local to a single character

3. Binding Model (v2)
3.1 Binding Shape
BoneBinding {
  boneId: string
  nodeId: string
  weight?: number   // default = 1
}


Rules:

weight ∈ [0, 1]

missing weight → 1

multiple bindings per node allowed

binding order must be deterministic

4. Deformation Output Contract

Deformation outputs a new derived node layout, never mutating truth:

DerivedNode {
  layout: {
    x, y, width, height
  }
  rotation?: number
}


Only these properties may be affected:

position (x, y)

rotation

optionally scale via width/height (future)

No other node fields may be touched.

5. Deformation Math Model (Conceptual)
5.1 Pivot Rule (Critical)

Nodes deform around their center point.

pivot = {
  x: node.layout.x + node.layout.width / 2,
  y: node.layout.y + node.layout.height / 2
}


Bones rotate nodes around this pivot.

No top-left rotation hacks.

5.2 Single-Bone Influence

If a node is bound to one bone:

apply bone rotation delta

preserve node dimensions

rotate around pivot

translate relative to skeleton root

This is the common cartoon case.

5.3 Multi-Bone Influence (Blended)

If bound to multiple bones:

finalRotation =
  Σ(boneRotation * weight) / Σ(weights)


Rules:

weights are normalized

if Σ(weights) = 0 → skip deformation

NaN → skip deformation

v2 does not support positional blending yet — only rotation.

6. Coordinate Space Contract

Bone transforms are in skeleton local space

Node layout is in character local space

Deformation converts skeleton-space → character-space once

No world space math allowed here.

7. What Deformation Must NOT Do

Bone deformation must never:

❌ move nodes outside character frame arbitrarily
❌ create negative width / height
❌ overwrite node animation
❌ affect non-bound nodes
❌ depend on viewport / camera

If it does, it’s a bug.

8. Failure Handling (Mandatory)
8.1 Binding Failures

If:

bone missing

node missing

binding invalid

Then:

skip that binding

continue others

log dev warning (once per frame)

8.2 Math Failures

If any computed value is:

NaN

Infinity

Then:

revert node to pre-deformation layout

do not partially apply deformation

9. Determinism Guarantees

Given:

same node layout

same skeleton

same bone transforms

Deformation must output identical results.

No randomness. No timing.

10. Debug Hooks (Design Only)

Deformation must expose:

per-node applied rotation

contributing bones + weights

pre/post layout

Used by:

Skeleton Debug UI

Motion trails

Inspector readouts

11. Explicit Non-Goals (v2)

Bone → Node Deformation v2 does not include:

❌ vertex skinning
❌ mesh deformation
❌ per-vertex weights
❌ non-linear warping
❌ physics

Those are v3+.

12. Mental Model

Bones bend nodes. Nodes stay rectangular.
That’s the whole deal for v2.

Status

✅ Design complete
🛑 Implementation deferred
📌 Safe to implement after solvers exist
