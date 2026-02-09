🧯🦴 Skeleton v2 — Failure Modes & Debug Guarantees

Goal: Skeletons must fail loudly, locally, and safely — never silently and never catastrophically.

This section defines what can go wrong, how the system reacts, and what the user/dev always gets to see.

1. Core Safety Principle

Skeleton failure must never corrupt animation, characters, attachments, or rendering.

Skeletons are additive and removable.

If skeleton logic fails:

animation still plays

nodes still render

interaction still works

2. Failure Isolation Boundary

Skeleton operates inside a strict boundary:

animation output → [ skeleton ] → character → attachments → render


If skeleton fails:

input = animation output

output = animation output (pass-through)

downstream systems continue normally

3. Recognized Failure Categories
3.1 Structural Failures

Missing bone

Missing bind pose

Node bound to multiple bones

Skeleton attached to multiple characters

Response

Skip skeleton deformation for affected nodes

Emit dev warning

Continue pipeline

3.2 Math Failures

NaN / Infinity in transforms

Zero-length bone

Singular matrices

IK non-convergence

Response

Clamp / discard invalid deltas

Fall back to bind pose

Mark bone as “invalid” for the frame

3.3 Authoring Failures

FK keys on IK-only chain

IK target outside reachable range

Overlapping IK chains

Invalid blend weights

Response

Clamp values

Ignore conflicting data

Visual warning (UI)

Never auto-fix silently

3.4 Runtime Failures

Missing registry entries

Partial skeleton load

Version mismatch (v1 vs v2)

Response

Disable skeleton for that character

Show “Skeleton disabled” badge

Keep animation + character working

4. Failure Visibility Rules

Failures must be visible but non-blocking.

Required Signals
Level	Surface	Example
Dev	console.warn	[Skeleton] IK solver failed for chain arm_L
UI	badge / icon	⚠️ Bone invalid
Debug	overlay	red bone / dashed line

No silent failures allowed.

5. Frame-Scoped Failures

Failures are per-frame, not sticky.

A bone may fail on frame 120

Recover on frame 121

System must not latch failure

This allows:

scrubbing

partial authoring

live correction

6. Deterministic Failure Behavior

Given the same inputs:

failure must occur the same way

output must be identical

No randomness.
No time-based heuristics.

7. Debug Introspection Contract

At any time, the system can answer:

getSkeletonDebug(characterId)


Returns:

{
  active: boolean,
  bones: {
    [boneId]: {
      valid: boolean,
      reason?: string,
      source: 'FK' | 'IK' | 'blend',
    }
  },
  chains: {
    [chainId]: {
      ikWeight,
      converged: boolean,
    }
  }
}


This powers:

overlays

inspector panels

dev tools

8. Visual Debug Guarantees
Mandatory Visuals (v2)

Bone lines

Joint points

IK target marker

Invalid bones in red

Inactive bones dashed

All read-only overlays.

9. No Cross-System Contamination

Skeleton failures must NOT:
❌ stop playback
❌ break onion skin
❌ break motion trails
❌ affect camera
❌ affect selection

Skeleton is never allowed to throw.

10. Version Safety

If skeleton data is newer than runtime supports:

Entire skeleton disabled

Warning shown

Character reverts to v1 behavior

No partial parsing.

11. Developer Guarantees

If something goes wrong, a developer can always answer:

Which bone failed

Why it failed

What data caused it

What fallback was used

No black boxes.

12. Why This Matters

This is what allows Dropple to:

scale to complex rigs

remain debuggable

stay artist-trustworthy

evolve to v3 safely

Without this, skeletons become a liability.

Where We Are Now

At this point, you have a complete Skeleton v2 spec:

Bone math

FK / IK blending

Node deformation

Character integration

Failure safety

All without touching code yet.
