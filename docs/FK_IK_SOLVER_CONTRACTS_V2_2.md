🧮 FK / IK Solver Contracts — Design Spec (v2.2)

Goal: define how FK and IK solvers behave, without prescribing implementation
Scope: inputs, outputs, invariants, failure handling
Out of scope: editor UX, timeline wiring, deformation

0. Prime Rule

Solvers compute transforms. They do not mutate state.

Every solver must be:

pure

deterministic

stateless

side-effect free

1. Coordinate Space Contract

All solver math operates in local bone space, relative to the skeleton root.

Definitions
BoneTransform {
  rotation: number        // radians
  length: number          // scalar
}


World/canvas space is never used inside solvers.

2. Forward Kinematics (FK)
2.1 FK Solver Signature
solveFK(
  bones: Bone[],
  rotations: Record<BoneId, number>
): Record<BoneId, BoneTransform>

Inputs

ordered bone tree

per-bone rotation values (from timeline or rest pose)

Output

per-bone local transforms

no positions, only rotation + length

2.2 FK Invariants

Parent transform always applied before child

Missing rotation → use restRotation

Bone length never modified

Tree traversal order is deterministic

FK cannot fail catastrophically.

3. Inverse Kinematics (IK)

IK is optional and scoped.

3.1 IK Solver Signature
solveIK(
  chain: BoneChain,
  target: Vec2,
  constraints?: IKConstraints
): Record<BoneId, number>   // rotations only

Inputs

ordered bone chain (root → end effector)

target position (local skeleton space)

optional constraints

Output

per-bone rotation overrides

rotations only

3.2 IK Constraints
IKConstraints {
  minAngle?: number
  maxAngle?: number
  iterations?: number
  tolerance?: number
}


Defaults are implementation-defined but must be finite.

4. FK / IK Blending Contract

FK and IK never fight directly.

4.1 Blending Rule
finalRotation =
  lerp(fkRotation, ikRotation, ikWeight)


Where:

ikWeight ∈ [0,1]

default ikWeight = 1 only when IK enabled

Blending happens per bone.

4.2 Blending Invariants

If IK fails → ikWeight = 0

If FK missing → fallback to restRotation

Never blend NaN

5. Solver Evaluation Order

Per character, per frame:

1. Evaluate FK rotations (timeline)
2. Evaluate IK chains (if enabled)
3. Blend FK / IK rotations
4. Output final bone rotations


No solver may observe node deformation.

6. Failure Handling (Mandatory)
6.1 IK Failure Conditions

Examples:

target unreachable

zero-length chain

NaN during iteration

non-converging solve

Handling:

abort IK solve

return FK-only result

emit dev warning (throttled)

7. Performance Guarantees

Solvers must:

be O(n) or bounded-iteration

never allocate per-frame garbage

allow early exit

If solver exceeds budget:

drop IK for that frame

continue render

8. Determinism Guarantee

Given identical inputs:

solver output must be identical

no random seeds

no time-based behavior

This ensures:

reproducible playback

deterministic export

9. Testability Contract

Solvers must be testable with:

input → output


No hidden dependencies.

Recommended tests:

straight chain

right-angle bend

unreachable target

zero-length bone

extreme rotations

10. Explicit Non-Goals (v2)

Solvers do not:

modify bone lengths

perform physics

handle collisions

solve multiple chains simultaneously

manage priorities

Those belong to later versions.

11. Mental Model

FK describes intention.
IK describes correction.
Blending decides authority.

Status

✅ Design complete
🛑 Implementation deferred
📌 Safe to implement independently of UI & timeline
