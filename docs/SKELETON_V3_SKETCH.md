🧭 Skeleton v3 — Directional Sketch (NOT LOCKED)

Skeleton v3 is where bones stop being “helpers” and become true deformation drivers — still derived, still safe, but far more expressive.

Think of v3 as:
Skeleton v2 (structure + math) × Deformation v1

1. What v3 Is For

Skeleton v3 exists to unlock:

Mesh-like deformation without meshes

Expressive characters (faces, spines, tails)

Reusable rigs

Higher-fidelity motion from the same timeline

It does not turn Dropple into a 3D engine or physics sim.

2. Core Philosophy (Carries Over from v2)

These do not change:

Nodes remain authoritative

Skeletons remain derived

No mutation of runtime truth

Animation v1 timelines still drive time

v3 builds on top, never underneath.

3. What Changes from v2 → v3
v2

Bones affect nodes rigidly

Rotation only

Rectangle-based deformation

v3

Bones influence nodes gradually

Weighted deformation

Shape-aware transforms

This is the big leap.

4. New Concepts Introduced in v3
4.1 Bone Influence Zones

Instead of:

“Bone controls node”

We get:

“Bone influences region”

BoneInfluence {
  boneId
  nodeId
  weight: number        // 0–1
  falloff: 'linear' | 'smooth'
}


Multiple bones can influence one node

Influence is additive

Order-independent

4.2 Per-Node Deformation Space

Each node gains a virtual local space (derived):

pivot

rest shape

deformation origin

Still not persisted.

5. Deformation Types (v3)

v3 introduces deformation modes, selectable per node:

5.1 Rigid (v2-compatible)

rotate + translate only

5.2 Bend

top and bottom move differently

spine / tail motion

5.3 Scale Gradient

squash & stretch

anticipation / follow-through

⚠️ Still no vertex skinning yet.

6. Skeleton Graph (New)

Skeletons become graphs, not just trees:

bones still hierarchical

influence graph is separate

cycles allowed in influence graph (but clamped)

This allows:

facial rigs

overlapping controls

secondary motion

7. Solver Evolution
v2

FK / IK only

v3 adds:

layered solvers

solver stacks

Example:

FK → IK → Aim → Secondary


Each solver:

pure

bounded

can be toggled

8. Timeline Integration (v3)

Bones become animatable targets:

track.target = {
  type: 'bone',
  boneId,
  property: 'angle' | 'length' | 'weight'
}


But:

still preview-only

still derived

still reversible

9. UI Direction (High Level)

v3 UI likely introduces:

Bone weight painting (node-based, not mesh)

Influence heatmaps

Deformation preview overlay

Rig presets (walk, idle, reach)

All UI-only until commit.

10. Debug & Safety (Stronger Than v2)

v3 must guarantee:

visual influence bounds

per-node deformation vectors

solver isolation

hard clamps on instability

If deformation explodes → auto fallback to v2 rigid mode.

11. Explicitly Still Out of Scope (v3)

❌ mesh skinning
❌ vertex weights
❌ physics bones
❌ ragdolls
❌ cloth

Those are v4 territory.

12. Migration Strategy (Important)

v2 rigs:

load unchanged

default to rigid deformation

zero influence weights

v3 features are opt-in per node.

13. Mental Model (v3)

v1 animates nodes
v2 bends nodes with bones
v3 deforms nodes with influence

Nothing ever breaks the core contract.

14. Why This Direction Is Safe

v2 implementation remains valid

v3 layers cleanly

no refactor pressure

no architectural betrayal

You can ship v2 characters, then grow into v3.
