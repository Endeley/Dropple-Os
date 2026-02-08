🧠🦴 SKELETON_V2.md

Status: LOCKED (Design-Only)

Skeleton v2 defines bones, solvers, deformation, and debugging as pure, derived systems layered on top of Animation v1.
This document freezes the contract. All future work must conform or target v3.

0. Scope & Intent

Skeleton v2 enables:

Bone hierarchies

FK / IK solving

Bone → node deformation

Character-scoped rigs

It does not enable:

Mesh skinning

Vertex weights

Physics

Runtime mutation

Skeleton v2 is math + structure only.

1. Core Invariants (Non-Negotiable)

Nodes remain authoritative

Bones never replace nodes

Node animation still runs first

Bones are derived

No bone state is persisted into runtime truth

Bones exist only during evaluation / render

Single ownership

A bone belongs to exactly one skeleton

A skeleton belongs to exactly one character

No nesting (v2)

Skeletons cannot reference other skeletons

Characters cannot contain characters

2. Execution Order (Frozen)

Per frame, per character:

1. Node animation (v1 timeline)
2. Character constraints (follow / pin / aim)
3. Attachments (props & sockets)
4. Skeleton solve (FK / IK)
5. Bone → Node deformation
6. Debug overlays (onion, trails, visuals)
7. Render


Any deviation is a bug.

3. Skeleton Model (Design Contract)
Skeleton {
  id: string
  rootBoneId: string
  bones: Record<BoneId, Bone>
}

Bone {
  id: string
  parentId?: string
  length: number
  restAngle: number
}


Rules:

Bones form a tree

No cycles

Parent space is local

4. Solver Contracts
4.1 FK Solver

Input:

bone hierarchy

animated bone angles

Output:

absolute bone transforms

FK:

deterministic

no constraints

no iteration

4.2 IK Solver

Input:

chain

target

constraints

Output:

solved bone transforms

IK rules:

max iterations

epsilon cutoff

clamp to limits

fallback to FK on failure

5. FK / IK Blending (Frozen)
finalPose = lerp(FK, IK, ikWeight)


Rules:

ikWeight ∈ [0, 1]

blending is linear

no hysteresis

no caching

6. Bone → Node Deformation (Frozen)

Deformation:

happens after solving

affects only bound nodes

is derived-only

Key rules:

rotation around node center

position preserved unless rotated

width/height preserved (v2)

Multiple bone influence:

rotation only

weighted average

deterministic order

Failures:

skip invalid bindings

revert node if math invalid

7. Debug Guarantees

Skeleton v2 must expose:

bone axes

joint positions

solver failure state

deformation deltas

Debug UI:

read-only

never mutates state

hideable during playback

8. Explicitly Out of Scope (v2)

Skeleton v2 does not include:

❌ vertex skinning
❌ mesh deformation
❌ bone weights UI
❌ physics
❌ muscle simulation
❌ runtime bone animation persistence

Those are v3+.

9. Failure Philosophy

Fail soft. Render something. Never corrupt truth.

If:

solver diverges

constraints invalid

deformation fails

Then:

fall back

warn in dev

keep rendering stable

10. Compatibility Guarantees

Skeleton v2:

does not break Animation v1

does not alter camera

does not affect canvas math

does not alter NodeView

Animation v1 remains fully valid without skeletons.

11. Version Lock

Skeleton v2 is design-locked.

Changes require:

Skeleton v3

explicit migration

new document

12. Mental Model (Final)

Animation moves nodes.
Skeletons bend nodes.
Nothing ever mutates truth.

✅ STATUS

Design: Complete

Implementation: Deferred

Safe to build later without refactors
