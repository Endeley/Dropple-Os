🦴 Skeleton Editor UI — Design Spec (v2)

Goal: allow users to create, structure, and inspect skeletons safely
Scope: bone creation, parenting, selection, visibility
Out of scope: solvers, deformation math, animation curves, IK logic

0. Prime Rule

Skeleton Editor mutates skeleton data only — never runtime truth, never node layout.

Bone edits:

update skeleton registry only

are undoable

never move nodes directly

1. Where the Skeleton Editor Lives

The Skeleton Editor is mode-scoped, not global.

Entry Point

Appears inside Animation Inspector

Only visible when:

exactly one character is selected

that character has or can have a skeleton

🦴 Rig
  ├─ Constraints
  ├─ Attachments
  └─ Skeleton   ← NEW


No skeleton UI outside character context.

2. Skeleton Panel Layout
🦴 Skeleton
────────────────────────
[ + Create Skeleton ]    (if none)
[ ✓ Enabled ]

Bones
 ├─ root
 │   ├─ spine
 │   │   ├─ head
 │   │   └─ arm_L
 │   │       └─ hand_L
 │   └─ leg_L
 │       └─ foot_L

Rules

Tree view = authoritative bone structure

Order reflects parent → child

Root bone is visually distinct

3. Skeleton Creation Flow (Minimal)
3.1 Create Skeleton

Button: + Create Skeleton

Behavior:

Creates empty skeleton

Auto-creates root bone

Root bone is anchored to character.rootId

No guessing. No auto-rigging.

4. Bone Creation (Manual, Explicit)
4.1 Create Bone

Button: + Bone

Bone creation requires:

selected parent bone

name

optional initial length

Default:

parent = selected bone

length = 40px

rotation = 0

Bones are created in local space, not world space.

4.2 Bone Placement Rule

Bone endpoints are conceptual, not positional.

The editor does not:

drag bones on canvas

snap bones to nodes

infer bone positions from layout

That comes later (editor v2.2+).

5. Parenting & Re-parenting
5.1 Parenting Rules

Bones form a tree

No cycles

Root has no parent

Drag-to-reparent allowed within tree only

Invalid operations:
❌ reparent root
❌ create cycles
❌ parent across characters

Invalid actions are blocked with tooltip explanation.

6. Bone Selection & Inspection
6.1 Selection

Click bone in tree → selects bone

Selection is editor-only, not canvas selection

Selecting a bone:

highlights it in Skeleton Debug Layer (if enabled)

shows Bone Inspector panel

6.2 Bone Inspector (Read-only in v2.0)
Bone: arm_L
────────────────
Parent: spine
Children: hand_L
Length: 42
Rest Rotation: 0.0
Status: OK


Editable fields not allowed yet:

length editing

rotation editing

binding editing

Those come in later versions.

7. Bone Deletion
7.1 Delete Bone

Allowed only if:

bone has no children

bone has no bindings

Otherwise:

disabled

tooltip explains why

Deleting a bone:

removes it from skeleton

undoable

never affects nodes directly

8. Binding Visibility (Not Editing)

Bindings are visible, not editable.

In Skeleton Editor:

show which nodes are bound to which bones

show warnings for invalid bindings

Actual binding editing happens in:
👉 Rig & Constraint Inspector (already built)

9. Canvas Interaction Rules

Skeleton Editor UI:

does not move nodes

does not draw bones by default

relies on Skeleton Debug Layer for visuals

Optional toggle:

[✓] Show Skeleton Overlay


This only turns on debug visuals.

10. Undo / Redo Guarantees

Every skeleton editor action:

is a single dispatcher event

is undoable

replays cleanly

If undo breaks skeleton:

skeleton is skipped

character renders as v1

warning shown

11. Safety & Failure Guarantees

If skeleton editor data becomes invalid:

editor disables invalid controls

skeleton debug shows warnings

user can always:

disable skeleton

delete skeleton

revert via undo

Skeleton editor must never trap the user.

12. Non-Goals (Explicit)

Skeleton Editor v2 does not include:

auto-rigging

canvas bone drawing/editing

IK handles

weight painting

skinning

Those are future layers, not missing features.

13. Mental Model

Skeleton Editor edits structure, not motion.
Motion lives in the timeline.
Deformation lives in evaluation.

Status

✅ Design complete
🛑 Implementation deferred
📌 Safe to build incrementally without revisiting contracts
