🦴🛠️ Skeleton Editor UX (Creation, Parenting, Mirroring)

Goal: allow users to build correct skeletons easily and make it hard to create broken rigs.

The editor enforces rules by design, not by warnings after the fact.

1. Core UX Principles

Explicit is better than implicit

Hierarchy is visible at all times

Invalid actions are impossible, not allowed

Authoring feels spatial, not form-based

Mirroring is first-class, not an afterthought

2. Entering Skeleton Edit Mode

Skeleton editing is a mode, not a toggle.

Modes:
• Design
• Animation
• Skeleton  ← new

Skeleton Mode Guarantees

Nodes cannot be animated

Timeline is read-only

Only skeleton tools are active

Visual skeleton overlay is always visible

This prevents cross-authoring mistakes.

3. Skeleton Creation Flow
3.1 Create Skeleton

Action

Animation Inspector → Create Skeleton


Requirements

Exactly one character selected

Character has ≥ 1 node

Result

Skeleton object created

Root bone auto-created at character root center

Skeleton enters edit mode

4. Bone Creation UX
4.1 Draw-to-Create (Primary)

Gesture

Click joint → drag → release


Result

New bone created

Parent = clicked bone

Child joint at cursor release

Visual

Live preview bone while dragging

Length label shown (px)

Angle snap when holding Shift

4.2 Context Creation (Secondary)

Right-click on joint:

Add Child Bone

5. Parenting Rules (Hard Constraints)

The editor enforces:

❌ no cycles
❌ no multi-parent bones
❌ no reparent across skeletons

Reparenting UX

Drag bone onto another bone

Drop zone highlights valid parents only

Invalid parents are visually blocked

6. Bone Selection & Editing
Selection

Click bone → select

Click joint → select joint

Shift → multi-select (same skeleton only)

Transform Editing

Allowed in Skeleton Mode:

rotate bone

move joint

adjust bone length

All edits update rest pose only, not animation.

7. Binding Bones to Nodes
Explicit Binding Only

Flow

Select bone

Select node

Click “Bind Node”

Result

Bind pose captured

Visual link shown (dotted line)

Editor prevents:
❌ binding one node to multiple bones
❌ binding nodes from other characters

8. Mirroring UX (First-Class)
8.1 Mirror Plane

Vertical mirror plane shown by default

Adjustable via gizmo

8.2 Mirror Creation

Option A — Live Mirroring

Toggle “Mirror Mode”

Creating/editing left side auto-creates right side

Option B — One-Shot Mirror

Select bones → Mirror

8.3 Naming Rules

Automatic naming:

Arm_L ↔ Arm_R
Leg_L ↔ Leg_R


Editable but validated.

9. Visual Feedback (Always On)
Bone Colors
State	Color
Root	gold
Normal	white
Selected	cyan
Mirrored	purple
Invalid	red
Bind Indicators

Bound node shows small chain icon

Hover shows bone name

10. Inspector Panels (Skeleton Mode)
Skeleton Panel
Skeleton
• Name
• Bone count
• Chain count
• Valid / Invalid

Bone Panel (when selected)
Bone: Arm_L
Parent: Spine_02
Children: Forearm_L
Length: 120px
Bound Node: hand_L


Read-only unless in skeleton mode.

11. Safety & Failure Prevention

The editor prevents:

deleting root bone

deleting parent with children (must reassign)

binding without rest pose

editing skeleton during playback

No “are you sure?” dialogs needed.

12. Debug Overlay Integration

While editing:

live axis indicators

angle values

constraint previews (FK only)

IK is disabled in skeleton mode.

13. Exit Skeleton Mode

On exit:

skeleton validated

warnings shown (if any)

animation mode restored

no auto-fixing

User remains in control.

14. Why This UX Works

This editor:

feels like drawing, not configuring

enforces correctness early

scales to complex rigs

prevents 90% of rig bugs

And most importantly:
👉 it matches the math contracts you already defined.

Where You Are Now (Big Picture)

You have now designed:

✅ Animation v1 (locked)
✅ Character system
✅ Constraints & attachments
✅ Onion skin, trails, debug layers
✅ Skeleton v2 math & safety
✅ Skeleton editor UX
✅ Bone keyframe timeline semantics

This is production-grade system design.
