# Phase 7 Compliance Checklist

Use this checklist for any PR that introduces or modifies animation,
motion, transitions, or visual state change.

## A. Applicability

- [ ] This PR introduces or modifies animation/motion
- [ ] This PR does not affect animation (skip checklist)

## B. Core Motion Rules

- [ ] Animation explains a state relationship, not a feature
- [ ] Animation duration <= 150ms
- [ ] Interaction is never blocked
- [ ] UX remains correct if animation is removed

❌ Any failure here blocks merge.

## C. State Traceability (Required)

For each animated transition:

- [ ] Origin is visible
- [ ] Destination is visible
- [ ] Transformation is implied

If any box is unchecked, animation must be removed.

## D. Allowed Animation Types Only

- [ ] Relevance shift (opacity / proximity / scale <= 1.05)
- [ ] Spatial continuity (move, not disappear)
- [ ] Result confirmation micro-feedback (<= 100ms)

## E. Forbidden Patterns (Hard Fail)

- [ ] No full-screen transitions
- [ ] No fade-to-black / fade-to-white
- [ ] No bounce / elastic / spring-heavy easing
- [ ] No looping or idle motion
- [ ] No animation that explains what happened

❌ Any checked item here = rejection.

## F. Mode Transitions

- [ ] Mode entry preserves canvas and timeline
- [ ] No screen wipes or resets
- [ ] Mode exit feels like relaxing constraints

## G. Panels & Tools

- [ ] Panels expand/collapse from anchor
- [ ] Tools fade relevance instead of disappearing
- [ ] Active tools move closer to focus
- [ ] Inactive tools retreat or dim

## H. Performance

- [ ] No dropped frames under normal load
- [ ] Animation degrades gracefully
- [ ] Animation removed if performance is uncertain

## Reviewer Verdict

- [ ] Approved — Phase 7 compliant
- [ ] Changes requested — motion contract violation
- [ ] Rejected — forbidden animation pattern

