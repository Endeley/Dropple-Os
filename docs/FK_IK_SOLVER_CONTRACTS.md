🦴 FK / IK Solver Contracts

Dropple Animation v2 — Math-Only Layer

Status: Design-only
Scope: Pure math
Side effects: ❌ None
State mutation: ❌ None
Determinism: ✅ Required

1. Core Principle (Non-Negotiable)

FK and IK solvers do not own state.
They accept inputs and return evaluated transforms.

No solver:

Writes to runtime

Emits intents

Reads UI state

Touches timeline

Touches camera

Touches nodes directly

They are pure functions.

2. Coordinate Space Contract

All solver math operates in world space.

Inputs

Bone rest transforms are already resolved to world space

Parent transforms are already evaluated

Outputs

World-space transforms only

No screen space. No viewport math. Ever.

3. Bone Transform Shape (Canonical)

Every solver consumes and produces this shape:

type BoneTransform = {
  position: { x: number; y: number };
  rotation: number;        // radians
  length: number;
};


Optional extensions (future):

scale?: number;

4. FK Solver Contract
4.1 Function Signature
function solveFK(
  bones: Bone[],
  inputs: {
    rotations: Record<BoneId, number>;
  }
): Record<BoneId, BoneTransform>;

4.2 FK Rules

Rotations are local

Parent rotation affects child orientation

Bone position is derived from parent endpoint

Math rule:

child.position =
  parent.position +
  rotate(
    { x: parent.length, y: 0 },
    parent.rotation
  )


FK:

No iteration

No convergence

O(n)

4.3 FK Guarantees

Deterministic

Order-stable

Always valid

FK never fails.

5. IK Solver Contract (2D, Chain-Based)
5.1 Function Signature
function solveIK(
  chain: BoneChain,
  inputs: {
    effector: { x: number; y: number };
    pole?: { x: number; y: number };
    iterations?: number;
    tolerance?: number;
  }
): Record<BoneId, BoneTransform>;

5.2 IK Inputs Explained
Input	Meaning
effector	Desired end position
pole	Bend direction hint
iterations	Max solver iterations
tolerance	Distance threshold

Defaults:

iterations = 10
tolerance = 0.5

6. IK Solver Behavior Rules
6.1 Reachability

Let:

maxReach = sum(bone.length)
distance = |effector - root.position|


Cases:

Case	Behavior
distance ≤ maxReach	Solve normally
distance > maxReach	Stretch toward effector (clamp)

No snapping. No teleporting.

6.2 Iterative Solving

Solver may use:

CCD (Cyclic Coordinate Descent)

FABRIK (preferred later)

But contract requires:

Deterministic iteration order

Same output for same input

6.3 Rotation Limits (Optional Input)
limits?: {
  [boneId]: { min: number; max: number };
}


Rules:

Enforced per iteration

Clamped rotations

Solver may fail gracefully

7. IK Output Guarantees

Solver must return:

A transform for every bone in chain

Always finite numbers

Always ordered from root → effector

If solver cannot converge:

Return best effort

Flag state (debug only)

meta?: {
  converged: boolean;
}

8. FK / IK Blending Contract
8.1 Function Signature
function blendFKIK(
  fk: Record<BoneId, BoneTransform>,
  ik: Record<BoneId, BoneTransform>,
  alpha: number // 0 → FK, 1 → IK
): Record<BoneId, BoneTransform>;

8.2 Blending Rules

Positions: linear interpolation

Rotations: shortest-path lerp

Length: unchanged

rotation = lerpAngle(fk.rotation, ik.rotation, alpha)

8.3 Alpha Constraints

alpha ∈ [0,1]

Outside values must be clamped

9. Solver Composition Order

For any skeleton:

1. Solve FK (base pose)
2. Solve IK (if enabled)
3. Blend FK/IK
4. Apply constraints (limits, pins)
5. Emit transforms


Each step:

Pure

Isolated

Testable

10. Error Handling Rules

Solvers must never:

Throw

Return NaN

Return undefined transforms

If invalid input:

Clamp

Return rest pose

Flag via meta (debug only)

11. Explicit Non-Responsibilities

Solvers do NOT:

Handle animation timing

Sample keyframes

Apply easing

Modify nodes

Apply attachments

Apply character constraints

Touch rendering

12. Why This Contract Works

This design:

Keeps math isolated

Enables unit testing

Allows swapping solvers

Prevents UI/engine coupling

Makes debugging visualizers trivial

13. Lock Statement

FK/IK solvers are math-only, deterministic, side-effect free functions.
Any violation is a bug.
