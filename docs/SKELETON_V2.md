🦴 SKELETON_V2.md

Dropple — Skeletons, Bones & Deformation (v2)

Status: Design-locked
Scope: Data contracts, evaluation order, safety rules
Out of scope: UI, solvers, rendering details, skinning

0. Purpose

Skeleton v2 introduces bone-based deformation for characters without breaking:

Animation v1 guarantees

Character grouping

Timeline determinism

Undo / replay safety

Skeletons are optional, derived, and strictly additive.

1. Prime Directives

Skeletons augment characters — they never replace them.

Skeletons are derived-only — they do not mutate runtime truth.

Skeleton failure must degrade gracefully to v1 behavior.

Characters remain the authoring & ownership unit.

2. Ownership & Scope
2.1 Character Owns Skeleton
Character {
  id: string
  rootId: string
  partIds: string[]
  skeletonId?: string
  skeletonEnabled?: boolean
}


Rules:

A skeleton cannot exist without a character

A character may have at most one skeleton

Skeletons are not shared or global

2.2 Skeleton Scope

Skeletons may only affect:

nodes listed in character.partIds

Skeletons must never:

deform non-character nodes

deform nodes from other characters

operate directly in world/canvas space

3. Skeleton Data Model
Skeleton {
  id: string
  characterId: string
  bones: Bone[]
  bindings: BoneBinding[]
}

3.1 Bone
Bone {
  id: string
  parentId?: string
  length: number
  restRotation: number
  localTransform?: Transform
}


Bones form a tree, not a graph.

3.2 Bone Binding
BoneBinding {
  boneId: string
  nodeId: string
  weight?: number
}


Rules:

nodeId must belong to character.partIds

A node may bind to multiple bones (future-proofing)

Invalid bindings are ignored at runtime

4. Evaluation Order (Canonical)

Final derived render pipeline:

Runtime / Preview State
 → Animation Evaluation (v1 timelines)
 → Character Constraints (follow / pin / aim)
 → Attachments (props & sockets)
 → Skeleton Solve (FK / IK)
 → Bone → Node Deformation
 → Onion Skin / Motion Trails / Debug Visuals
 → Render


Skeletons always run late.

5. Root Alignment Rule

The skeleton root is anchored to the character root:

skeletonRoot.position === characterRoot.layout.(x,y)


Implications:

Moving a character moves the skeleton

Skeleton never drifts independently

Coordinate space stays consistent

6. Timeline Integration

Skeleton animation lives in the same timeline as node animation.

Conceptual structure:

timeline.animations = {
  nodeTracks: { ... }
  boneTracks: { ... }
}


Rules:

Bone keyframes target bones

Node keyframes target nodes

Evaluators remain separate

Convergence happens at render time only

7. Attachments & Constraints Interaction
7.1 Attachments

Attachments are evaluated before skeleton deformation

Props attached to nodes naturally follow bone deformation

Attaching directly to bones is not supported in v2

7.2 Character Constraints

Follow / Pin / Aim apply before skeleton solve

Skeleton deforms the constrained result

Constraints are never overridden by bones

8. Enable / Disable Semantics

Skeletons can be toggled per character:

character.skeletonEnabled = boolean


When disabled:

skeleton solve skipped

deformation skipped

character renders exactly like v1

9. Failure Modes & Safety Guarantees
9.1 Failure Containment

Skeleton failure must:

never mutate runtime truth

never affect timeline data

never break playback or scrubbing

Fallback behavior:

ignore skeleton for that frame

render character as v1

9.2 Failure Classes
Failure Type	Handling
Structural (bad bindings)	skip skeleton
Math (NaN / Inf)	drop bone influence
Partial	disable affected bone only
Performance	allow manual disable
9.3 Finite Guards

All transforms must pass:

Number.isFinite(x)
Number.isFinite(y)
Number.isFinite(rotation)


Invalid transforms revert to identity.

10. Debug Guarantees (Dev Mode)

In NODE_ENV !== 'production':

Throttled console warnings

Grouped per character

Optional visual overlays:

bones

joints

disabled bindings

Skeletons must never trap the user.

11. Serialization Rules

Invalid skeleton data may exist in memory

Invalid data must not be serialized

Save/export drops invalid bones with warnings

12. Explicit Non-Goals (v2)

Skeleton v2 does not include:

vertex skinning

mesh deformation

physics

muscle simulation

bone-attached sockets

Those are v3+ concerns.

13. Mental Model

Characters define WHAT exists
Skeletons define HOW it bends
Bones never own truth

14. Status

✅ Design complete
🛑 Implementation intentionally deferred
📌 Locked until Animation v2 implementation begins
