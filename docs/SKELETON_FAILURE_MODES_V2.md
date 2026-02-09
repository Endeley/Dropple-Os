🦴 Skeleton v2 — Failure Modes & Debug Guarantees

Goal: nothing breaks silently.
If skeleton math fails, the system must degrade visibly, safely, and deterministically.

This is the contract that keeps v2 sane.

1. Core Rule (Non-Negotiable)

A skeleton failure must never corrupt runtime truth or crash rendering.

Instead:

animation continues (best effort)

deformation clamps or freezes

debug overlays explain why

2. Categories of Failure
A. Structural Failures
B. Mathematical Failures
C. Solver Failures
D. Integration Failures
E. Authoring / Data Failures

Each has a defined response.

3. Structural Failures
3.1 Cyclic Bone Hierarchy

Example

A → B → C → A


Detection

DFS with visited set

detected at skeleton build time

Response

Skeleton evaluation aborts

All bones in cycle render flashing red

Deformation disabled for affected nodes

Rest pose used as fallback

Guarantee

No infinite recursion

No stack overflow

No partial evaluation

3.2 Missing Parent Bone

Example

bone.parentId = "missing"


Response

Bone treated as temporary root

Warning badge in debug UI

Bone rendered yellow

3.3 Zero-Length Bone

Example

start === end


Response

Bone length clamped to epsilon

Rotation preserved

Visual: red dot

Length label shows 0px

4. Mathematical Failures
4.1 NaN / Infinity in Transforms

Detection

Any non-finite number in:

position

rotation

scale

Response

Freeze last known valid pose

Render bone red

Emit dev warning (once per bone)

Never

propagate NaNs

mutate runtime nodes

4.2 Extreme Scale / Rotation Explosion

Example

scale = 1e12
rotation = 10^6°


Response

Clamp to max safe values

Flag bone as unstable

Optional overlay: “clamped”

5. Solver Failures (FK / IK)
5.1 IK Does Not Converge

Response

Stop after max iterations

Use best intermediate solution

Visualize solver ghosts (future)

Badge: “IK not converged”

5.2 IK Target Unreachable

Response

Fully extend chain toward target

Show dashed line from end effector → target

No snapping, no popping

5.3 Conflicting Constraints

Example

Pin X + Aim + IK all active

Response

Constraint priority order applies

Lower-priority constraints ignored

Debug UI lists ignored constraints

6. Integration Failures (Skeleton → Character → Nodes)
6.1 Bone → Node Mapping Missing

Example

bone.controlsNodeId = undefined


Response

Node excluded from deformation

Bone still evaluates

Visual warning icon

6.2 Character + Skeleton Conflict

Example

Character constraint overrides skeleton deformation

Rule

Skeleton deformation happens before character constraints.

If conflict

Skeleton wins for geometry

Character constraints apply after

Debug UI shows override order

7. Timeline & Animation Failures
7.1 Missing Bone Keyframes

Response

Bone uses rest pose

Interpolation skipped

Label: “rest”

7.2 Mixed Time Units (ms vs frames)

Rule

Skeleton v2 time is always ms.

If mismatch

Convert explicitly

Warn in dev

Never guess

8. Authoring & Data Failures
8.1 Partial Skeleton Definitions

Example

joints exist

bones missing

Response

Skeleton renders joints only

Bones skipped

Authoring still allowed

8.2 Deleted Node Referenced by Bone

Response

Bone disabled

Debug warning

No crash

9. Global Safety Guarantees
Guaranteed at all times

❌ No mutation of runtime truth

❌ No camera or viewport dependency

❌ No silent failure

❌ No animation corruption

Always true

Skeleton debug is opt-in

Failures are localized

Rendering always completes

10. Debug Severity Levels
Level	Color	Meaning
Info	Blue	benign fallback
Warn	Yellow	degraded behavior
Error	Red	evaluation halted
Fatal	Flashing Red	structural violation
11. Why This Matters

This guarantees:

You can ship v2 incrementally

Broken rigs don’t destroy scenes

Artists see what’s wrong immediately

Solvers can evolve safely

This is how professional animation tools stay stable.
