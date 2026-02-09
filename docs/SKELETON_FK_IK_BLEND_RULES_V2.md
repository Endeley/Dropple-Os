🦴 Skeleton v2 — FK / IK Blending Rules

Goal: FK and IK must coexist, blend predictably, and never fight.

This section defines what blends, when it blends, and who wins — independent of UI or solver math.

1. Core Principle

FK and IK are not modes. They are weighted influences.

There is no global FK/IK switch.

Every bone chain evaluates:

Final Pose = mix(FK Pose, IK Pose, weight)


Where:

weight ∈ [0, 1]

0 → pure FK

1 → pure IK

2. Where FK / IK Lives in the Timeline
FK

Driven by bone keyframes

Per-bone rotation / translation keys

Always available

IK

Driven by IK target tracks

Target position (world space)

Optional pole vector

Optional stretch

Blend Weight

Animated per chain

Timeline property: ikWeight

3. Canonical Evaluation Order

For a single frame t:

1. Sample FK keyframes → fkPose
2. Sample IK targets → ikTargets
3. Solve IK → ikPose
4. Blend fkPose & ikPose using ikWeight
5. Output final bone transforms


FK is never overridden — only blended.

4. Blend Scope (Very Important)
FK is per-bone
IK is per-chain

So:

FK applies to every bone

IK applies only to bones in its chain

Bones outside the chain remain FK-only

5. Blend Weight Rules
5.1 Default
ikWeight = 0


Skeleton behaves 100% FK unless explicitly animated.

5.2 Weight Evaluation

Weight is sampled once per chain per frame

Weight is clamped [0,1]

Weight interpolation follows easing

5.3 Partial Blending

Allowed:

0.0 → FK
0.5 → half FK / half IK
1.0 → IK


This enables:

soft transitions

animation layering

handoff between systems

6. Multiple IK Chains

Allowed if they don’t overlap.

Rules

Chains may not share bones

If they do → error

First declared chain wins

Others ignored with warning

7. IK Overrides FK — But Only Where Allowed

FK still exists for:

bones outside IK chain

blend weight < 1

solver failure fallback

IK never deletes FK data.

8. Pinning + FK / IK Interaction
Pin constraint

Applied after blending

Prevents movement on specific axes

Rule
Final = applyPin( blend(FK, IK) )


Pins never affect solver input.

9. Aim Constraint Interaction

Aim is treated as a post-blend rotation modifier.

Order:

FK → IK → Blend → Aim → Pin


Aim:

never feeds back into solver

never affects FK keys

10. IK Failure + Blending

If IK fails to converge:

Solver returns best pose

Blend still occurs

If catastrophic failure:

IK pose ignored

FK pose used

Weight visually marked invalid

11. Timeline Authoring Rules
11.1 IK Weight Track

One ikWeight track per chain

Keyframes allowed

Easing allowed

11.2 IK Target Track

Position only (world space)

Optional pole vector

Animated independently from FK

12. What Is Explicitly NOT Allowed

❌ IK writing FK keys
❌ FK keys mutating IK targets
❌ Solver feedback loops
❌ Implicit switching between FK / IK
❌ Hidden constraints

Everything is explicit and animatable.

13. Why This Works

This gives you:

Smooth FK ↔ IK transitions

Animator-friendly workflows

Layered animation

Debuggable behavior

Zero ambiguity

It matches how pro tools (Maya, Blender, Spine) reason — but cleaner.
