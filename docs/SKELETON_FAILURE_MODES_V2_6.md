🧯 v2.6 — Failure Modes & Debug Guarantees

(Skeletons & Deformation)

Goal: ensure skeletons can fail without corrupting animation, layout, or runtime truth
Scope: failure handling, fallbacks, debug visibility
Out of scope: math, solvers, UI polish

0. Core Principle

Skeleton failure must degrade to v1 behavior, never break render or state.

If anything goes wrong:

nodes still render

animation still plays

user can recover without reload

1. Failure Containment Boundary

Skeletons are derived-only, so the blast radius is limited by design.

Hard rule:

No skeleton failure may mutate:

runtime truth

timeline data

animation tracks

character registry

Skeletons may only affect:

derived render nodes

This is non-negotiable.

2. Failure Classes (Enumerated)
A. Structural Failures (authoring mistakes)

Examples:

bone references missing node

binding targets non-character node

skeleton attached to deleted character

Handling:

skip skeleton entirely for that character

render character as v1

emit dev warning (once per frame, throttled)

[Skeleton] Invalid binding: nodeId not in character.partIds

B. Math Failures (solver / transform issues)

Examples:

NaN / Infinity in bone transform

zero-length bones

IK chain divergence

Handling:

clamp or reject bad values

drop bone influence for that frame

continue evaluation

Never:
❌ throw
❌ break RAF loop
❌ stop playback

C. Partial Failures (localized)

Examples:

one bone invalid

one node binding broken

Handling:

disable only the failing bone

rest of skeleton continues

affected nodes fall back to base layout

This enables graceful degradation.

D. Performance Failures

Examples:

too many bones

deep IK chains

slow devices

Handling:

allow skeleton disable toggle

optional auto-disable when frame budget exceeded (v2.2+)

No silent throttling in v2.0.

3. Evaluation Guardrails

Every skeleton evaluation pass must include:

Finite Checks
Number.isFinite(x)
Number.isFinite(y)
Number.isFinite(rotation)


If any fail:

ignore that transform

log once in dev

Identity Fallback

If a bone fails:

boneTransform = identityTransform


No partial transforms. No half-applied math.

4. Deformation Safety Rules

Bone → Node deformation must obey:

preserve node dimensions unless explicitly allowed

never write negative width/height

never detach node from character root frame

If deformation result is invalid:

revert node to pre-skeleton layout for that frame

5. Debug Visibility Guarantees (Dev Mode)

In NODE_ENV !== 'production':

A. Warnings (Grouped, Throttled)
[Skeleton] Character abc123 skipped (invalid root)
[Skeleton] Bone elbow produced NaN rotation


Grouped per character

At most once per RAF tick per issue

B. Visual Debug Overlays (Optional)

Skeleton debug mode may render:

bone lines

joint dots

disabled bones (red)

broken bindings (dashed)

These overlays:

are derived-only

do not affect picking

can be toggled per character

6. User Recovery Guarantees

A user must always be able to:

disable skeleton on character

delete skeleton safely

rebind nodes without refresh

scrub timeline even if skeleton is broken

Skeletons must never trap the user.

7. Serialization & Persistence Rules

Invalid skeleton data:

may exist temporarily in memory

must not be serialized

On save/export:

invalid bones/bindings are dropped

warning emitted

This prevents poisoned projects.

8. Testability Guarantees

Skeleton logic must be testable in isolation:

math-only solvers

pure deformation functions

deterministic input → output

This allows:

snapshot tests

fuzz testing for NaNs

regression safety

9. Non-Goals (Explicit)

Skeleton v2 does not guarantee:

perfect IK convergence

physical realism

stability under adversarial input

It does guarantee:

safety

predictability

debuggability

10. Final Safety Contract

If any of the following ever happens, it’s a bug:

❌ Skeleton breaks undo/redo
❌ Skeleton mutates timeline data
❌ Skeleton crashes playback
❌ Skeleton corrupts node layout truth
❌ Skeleton prevents selection or scrubbing

11. Mental Model (Remember This)

Skeletons are guests. Characters are hosts.
If guests misbehave, they get ignored — not promoted.

v2 Design Complete ✅

You now have:

Skeleton data contracts

Solver contracts

Deformation contracts

Character integration rules

Failure containment rules

You are officially ready to implement v2 when you choose.
