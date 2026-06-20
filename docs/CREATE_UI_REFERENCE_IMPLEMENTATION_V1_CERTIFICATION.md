# Create/UI Reference Implementation v1 Certification

## Purpose

This document is the certification gate for `Create > UI/UX`.

Create/UI is no longer treated as an open-ended engineering lane.
It is treated as the first constitutionally correct reference implementation
of the Project World model.

If this board passes, Create/UI is frozen as:

`Create/UI Reference Implementation v1`

Not feature-complete.

Not production-complete.

But constitutionally complete.

## Certification Rule

Do not add new Create/UI capabilities until this board is complete.

The goal is to prove:

- Project World behavior
- shared interaction authority
- contextual surface behavior
- motion relevance behavior
- project memory behavior

in the rendered product.

## Automated Verification Status

The following are already verified by runtime tests and build verification:

- [x] Selection Truth
- [x] Delete Truth
- [x] Project Memory
- [x] First Remembered Artifact
- [x] Timeline Relevance
- [x] Context Menu Lifecycle
- [x] Drag Fidelity
- [x] Resize Fidelity
- [x] Fail-Closed Sessions
- [x] Motion Law Alignment
- [x] Runtime certification suite passing
- [x] `build:smoke` passing

## Product Certification Board

### World

- [ ] New project
- [ ] Home dominant
- [ ] World state = empty

### Creation

- [ ] Create frame
- [ ] World becomes worked
- [ ] Home recedes correctly

### Interaction

- [ ] Select frame
- [ ] Drag frame
- [ ] Resize frame
- [ ] Right-click frame

### Structure

- [ ] Delete frame
- [ ] Undo
- [ ] Redo
- [ ] Group
- [ ] Ungroup

### Motion

- [ ] Attach motion
- [ ] Timeline appears
- [ ] Remove motion
- [ ] Timeline recedes

### Memory

- [ ] Delete last frame
- [ ] Inspector recedes
- [ ] Timeline recedes
- [ ] World remains worked
- [ ] History remains
- [ ] First remembered artifact remains

### Final Gate

- [ ] No unexpected shell regressions
- [ ] No duplicate authority discovered

## Certification Outcome

If every product checkbox passes:

`Create/UI Reference Implementation v1`

`CERTIFIED`

## Next Phase

After certification, the next lane is:

`Graphic Inheritance Pass`

Goal:

Prove reusability.

Not:

Build a feature-complete Graphic workspace.

### Graphic Inheritance Principle

Graphic must inherit:

- Project World
- Shared Interaction Authorities
- Contextual Surface Laws
- Motion Law

without introducing:

- Graphic Selection
- Graphic Delete
- Graphic Drag
- Graphic Resize
- Graphic Timeline
- Graphic Navigation

The milestone is:

Create/UI proves correctness.

Graphic proves reusability.
