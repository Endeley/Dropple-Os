🎨 Skeleton v3 — Weight Painting (Node-Based Contract)

Goal: define how weights are represented, edited, and evaluated, without UI or storage assumptions.

0. Core Principle

Weights belong to (node × bone), not to vertices.

Why this matches your system:

Dropple nodes are rectangular, semantic objects

You already animate layout + rotation, not meshes

Keeps math fast, deterministic, and debuggable

1. Weight Data Model (Canonical)

Each node can have multiple bone weights.

NodeBoneWeight {
  nodeId: string
  boneId: string
  weight: number        // [0..1]
  falloff?: 'linear' | 'smooth'   // default: smooth
  locked?: boolean      // prevents auto-normalization
}


Stored conceptually as:

weightsByNode: {
  [nodeId]: {
    [boneId]: NodeBoneWeight
  }
}


No requirement that weights sum to 1.

2. Rest Pose Capture (Mandatory)

When a weight is first created:

RestPose[nodeId][boneId] = {
  node: { x0, y0, w0, h0, r0 },
  bone: { start0, end0, r0 }
}


This is what makes deformation:

reversible

stable

immune to drift

❗ Never recompute rest pose implicitly.

3. Weight Evaluation Pipeline (Read-Only)

For a node N at time t:

Sample animation → node layout

Sample bone animation → bone transforms

Apply character constraints

Apply bone influence math (from v3-Step-1)

Apply attachments

Render

Weight painting only affects Step 4.

4. Weight Normalization Rules
Default behavior (recommended)

Weights are independent.

Two bones with weight 1 → strong combined influence

Safe due to normalization clamp in math layer

Optional normalization mode (per node)
normalize: 'none' | 'soft' | 'hard'


none → raw weights

soft → normalize only if sum > 1

hard → always normalize to sum = 1

This is a node-level flag, not global.

5. Locked Weights

If locked === true:

Weight is excluded from normalization

Used for:

torso anchors

pinned props

facial controls later

Rule:

locked weights are applied first, remainder is normalized

6. Brush Semantics (UI-Agnostic)

Even though we’re not building UI yet, the math assumes these semantics:

Add brush
w = clamp(w + strength * pressure)

Subtract brush
w = clamp(w - strength * pressure)

Smooth brush
w = lerp(w, neighborAverage, smoothFactor)

Erase
delete NodeBoneWeight


This makes painting predictable later.

7. Spatial Falloff (Optional, v3-safe)

You may optionally modulate weight by distance to bone:

effectiveWeight = paintedWeight * distanceFalloff(nodeCenter, bone)


Where:

distanceFalloff(d) = clamp(1 - d / maxRadius)


This is derived, never stored.

8. Debug Guarantees

For any node:

Sum of applied weights is visible

Each bone contribution can be toggled solo

Rest pose comparison always possible

If a node explodes:

It is always traceable to a single bone + weight

9. Explicit Non-Goals (By Design)

❌ Vertex weights
❌ Mesh skinning
❌ Automatic heat-map binding
❌ Implicit parenting through weights

Those belong to v3.5+, not now.

10. Why This Is the Right Call

This design:

Matches your rect-node architecture

Plays perfectly with timeline keyframes

Works with attachments & constraints

Is future-proof for:

facial rigs

mechanical rigs

UI animation
