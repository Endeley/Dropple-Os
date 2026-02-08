🦴🧍 v2.5 — Skeleton → Character Integration Rules

Goal: define how skeletons coexist with characters, attachments, constraints, and animation
Scope: contracts + invariants only
Out of scope: UI, solvers, rendering

0. Prime Directive

A Skeleton augments a Character — it never replaces it.

Characters remain the authoring & grouping unit.
Skeletons are optional deformation layers attached to characters.

If a character has no skeleton, everything still works (v1 behavior).

1. Ownership Model
Character owns the Skeleton
Character {
  id
  rootId
  partIds
  skeletonId?: string
}


Rules:

A skeleton cannot exist without a character

A character may have at most one skeleton

Skeletons are not global objects

This prevents:

skeleton reuse bugs

cross-character coupling

timeline ambiguity

2. Skeleton Scope

Skeletons operate only on character parts.

Allowed

✅ Bone → Node deformation where node ∈ character.partIds
✅ Bone animation inside character timeline
✅ Character-level enable/disable of skeleton

Forbidden

❌ Deforming non-character nodes
❌ Deforming another character’s parts
❌ Attaching bones directly to canvas/world

This keeps skeletons local and predictable.

3. Evaluation Order (Updated)

Final derived render pipeline becomes:

Base Nodes (runtime / preview)
  → Animation Evaluation (v1 timelines)
  → Character Constraints (follow / pin / aim)
  → Attachments (props, sockets)
  → Skeleton Solve (FK / IK)
  → Bone → Node Deformation   ← NEW
  → Onion Skin / Motion Trails
  → Render


Key insight:

Skeletons are late, not early

They deform results, not truth

This guarantees:

animation still drives motion

skeletons never fight keyframes

attachments stay glued correctly

4. Character ↔ Skeleton Contract
Binding Point
Skeleton {
  id
  characterId
  bones: Bone[]
  bindings: BoneBinding[]
}


Hard rules:

Skeleton.characterId must exist

Bone bindings must target nodes in character.partIds

Root bone must align with character.rootId

5. Root Alignment Rule (Critical)

The skeleton root is anchored to the character root — not free-floating.

skeletonRoot.start === characterRoot.layout.(x,y)


Implications:

Moving the character moves the skeleton

Skeleton never drifts or desyncs

World space stays consistent

This mirrors how:

attachments follow hosts

character parts follow roots

6. Attachments + Skeletons

Attachments run before skeleton deformation.

That means:

A sword attached to a hand node

Hand node is then deformed by bone

Sword naturally follows the animation

This is exactly what you want.

❌ Attaching directly to bones is forbidden in v2
(too many coordinate-space edge cases)

7. Constraints + Skeletons

Character constraints (follow, pin, aim):

Run before skeleton solve

Affect base node transforms

Skeleton deforms the result

Example:

Head node has aim: cursor

Skeleton rotates spine

Final head rotation = aim + bone deformation

Clean composition. No overrides.

8. Timeline Integration Rule

Skeleton animation lives in the same timeline as node animation.

But:

Bone keyframes target bones

Node keyframes target nodes

Evaluators remain separate

Timeline structure (conceptual):

timeline.animations = {
  nodeTracks: ...
  boneTracks: ...
}


They converge only at render time.

9. Enable / Disable Semantics

Skeleton can be toggled per character:

character.skeletonEnabled: boolean


When disabled:

bones ignored

deformation skipped

character renders as v1

This is crucial for:

debugging

performance

gradual adoption

10. What Is Explicitly NOT Allowed (v2)

❌ Skeletons outside characters
❌ Multiple skeletons per character
❌ Cross-character bone influence
❌ Bone-driven layout authoring
❌ Skinning / vertex deformation

Those are v3+ by design.

11. Why This Integration Is Correct

✔ Preserves all v1 guarantees

✔ Makes skeletons opt-in

✔ Keeps character as the mental model

✔ Avoids double transforms

✔ Keeps evaluation deterministic

✔ Allows cartoon rigs immediately

✔ Future-proofs advanced rigs

12. Mental Model (Remember This)

Characters define WHAT exists
Skeletons define HOW it bends

If you remember that, you won’t make bad decisions later.

Where This Will Be Documented
SKELETON_V2.md
ANIMATION_V1.md (linked)


No code required yet.
