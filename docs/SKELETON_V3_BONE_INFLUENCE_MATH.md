🧠 Skeleton v3 — Bone Influence Math (Exact, Math-Only)

This defines how bones influence nodes numerically.
It is pure, deterministic, order-independent, and derived-only.

0. Definitions (strict)

We assume everything is evaluated after animation sampling and before render.

Inputs (already known)

node.layout → { x, y, width, height }

bone → { start, end, rotation, length }

timeMs (already handled upstream)

No mutation allowed.

1. Influence Model Overview

Each node can be influenced by N bones.

Final node transform is the weighted sum of bone transforms, blended against the node’s rest pose.

Bones never “own” nodes — they influence them.

2. Bone Influence Record (conceptual)
BoneInfluence {
  boneId: string
  nodeId: string
  weight: number        // [0..1]
  falloff: 'linear' | 'smooth'
  space: 'local' | 'world'   // default: local
}


A node may have multiple BoneInfluences

Total weights are not required to sum to 1

3. Rest Pose (Critical)

Every node has an implicit rest pose:

RestPose {
  x0, y0,
  width0, height0,
  rotation0
}


Captured:

at rig creation time

or lazily on first influence

Used as the blend anchor.

4. Bone Transform Extraction

For each bone, compute its delta transform relative to rest:

4.1 Bone Angle Delta
Δθ_bone = bone.rotation - bone.restRotation

4.2 Bone Translation Delta (optional)

If bone has translation (v3 optional):

Δx_bone = bone.start.x - bone.restStart.x
Δy_bone = bone.start.y - bone.restStart.y

5. Influence Falloff Function

Each influence weight w is shaped by falloff:

Linear
f(w) = w

Smooth (recommended default)
f(w) = w² * (3 - 2w)


This prevents snapping near 0 and 1.

6. Per-Bone Contribution (Node Space)

For a node with center C = (cx, cy):

6.1 Rotate Around Bone Pivot

Let:

P = bone pivot (usually bone.start)

θ = Δθ_bone * f(w)

Rotation contribution:

R(P, θ) applied to C


Which expands to:

x' = cos(θ)*(cx - Px) - sin(θ)*(cy - Py) + Px
y' = sin(θ)*(cx - Px) + cos(θ)*(cy - Py) + Py

6.2 Translation Contribution (if enabled)
Tx = Δx_bone * f(w)
Ty = Δy_bone * f(w)

7. Accumulating Multiple Bones (Order-Independent)

Initialize accumulators:

sumX = cx
sumY = cy
sumAngle = rotation0
sumWeight = 0


For each influencing bone i:

sumX += (x_i - cx)
sumY += (y_i - cy)
sumAngle += Δθ_i * f(w_i)
sumWeight += f(w_i)

8. Normalize (Optional but Recommended)

If sumWeight > 1:

sumX = cx + (sumX - cx) / sumWeight
sumY = cy + (sumY - cy) / sumWeight
sumAngle = rotation0 + (sumAngle - rotation0) / sumWeight


This prevents over-rotation.

9. Final Node Transform
final.x = sumX
final.y = sumY
final.rotation = sumAngle
final.width = width0   // unchanged in v3.0
final.height = height0


Scale & squash come later (v3.1+)

10. Guarantees

This math guarantees:

✅ Deterministic output
✅ No order dependence
✅ Multiple bones blend safely
✅ Rest pose preserved at weight 0
✅ Full control at weight 1

11. Failure Clamps (Mandatory)

To prevent explosions:

|Δθ_total| ≤ MAX_ROTATION   // e.g. π radians
|Δx|, |Δy| ≤ MAX_OFFSET    // node-size relative


If exceeded → clamp and warn (dev only).

12. Why This Works Well With Your Architecture

Pure function

No timeline mutation

No runtime truth mutation

Slots cleanly after:

animation evaluation

character constraints

attachments

Exactly where you already operate.
