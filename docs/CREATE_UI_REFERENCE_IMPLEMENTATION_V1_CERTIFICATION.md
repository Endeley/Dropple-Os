# Create/UI Reference Implementation v1 Transition Board

## Purpose

This document is the transition board for `Create > UI/UX`.

Create/UI is no longer treated as an open-ended engineering lane.
It is treated as the first constitutionally correct reference implementation
of the Project World model.

Current lifecycle state:

`Verified`

Target transition:

`Verified -> Frozen`

If this transition board closes, Create/UI is frozen as:

`Create/UI Reference Implementation v1`

Not feature-complete.

Not production-complete.

But constitutionally complete.

This board is constitutional transition truth.

The current product-expression lane for this transition is:

`Create/UI Expression`

For the bridge from constitutional truth to creator experience, see:

- [PRODUCT_EXPRESSION_PRINCIPLES.md](./PRODUCT_EXPRESSION_PRINCIPLES.md)
- [CREATE_UI_EXPRESSION_MILESTONES.md](./CREATE_UI_EXPRESSION_MILESTONES.md)

## Transition Rule

Do not add new Create/UI capabilities until this board is complete.

The goal is to identify the evidence still required to freeze:

`Create/UI Reference Implementation v1`

This board does not ask:

`What work is left?`

It asks:

`What evidence is still missing for the transition from Verified to Frozen?`

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

## Transition Board

Every implementation task on this board should answer one question:

`Which evidence for the Verified -> Frozen transition does this task produce?`

### A. Experience Evidence

These items prove that the creator experiences the constitution correctly.

Success question:

`Does the product naturally guide the creator?`

- [ ] New project
- [ ] Home dominant
- [ ] World state = empty
- [ ] Create frame
- [ ] World becomes worked
- [ ] Home recedes correctly
- [ ] First remembered artifact remains

Potential implementation work that produces this evidence:

- [ ] First artifact journey refinement
- [ ] Capability projection refinement
- [ ] Artifact evolution refinement
- [ ] Creative momentum refinement
- [ ] Context-sensitive exposure refinement

### B. Interaction Evidence

These items prove that interaction authority remains constitutionally correct
under normal workflows.

Success question:

`Does interaction remain constitutionally correct under normal workflows?`

- [ ] Select frame
- [ ] Drag frame
- [ ] Resize frame
- [ ] Delete frame
- [ ] Undo
- [ ] Redo
- [ ] Group
- [ ] Ungroup
- [ ] Attach motion
- [ ] Remove motion

Potential implementation work that produces this evidence:

- [ ] Selection workflow refinement
- [ ] Grouping workflow refinement
- [ ] Resize and drag refinement
- [ ] Motion attachment workflow refinement

### C. Projection Evidence

These items prove that surfaces project capability rather than own behavior.

Success question:

`Does every surface reveal the right capability at the right time?`

- [ ] Right-click frame
- [ ] Timeline appears
- [ ] Timeline recedes
- [ ] Inspector recedes

Potential implementation work that produces this evidence:

- [ ] Inspector context refinement
- [ ] Timeline emergence refinement
- [ ] Context menu projection refinement
- [ ] Creation rail and top bar projection refinement

### D. Certification Evidence

These items prove the implementation is stable enough to freeze.

Success question:

`Can we repeatedly prove the same experience?`

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
- [ ] No unexpected shell regressions
- [ ] No duplicate authority discovered

Supporting stability evidence:

- [ ] Playwright certification remains green
- [ ] Release Trust remains green
- [ ] Architecture gates remain green
- [ ] Drift guard remains green
- [ ] Manual certification scenarios are repeatable

### E. Remaining Gaps

Only after the evidence categories above are clear should specific
implementation tasks be added here.

Examples:

- [ ] First artifact suggestions
- [ ] Intelligent asset projection
- [ ] Context-aware capability sections
- [ ] Better artifact evolution prompts
- [ ] Contextual styling evolution
- [ ] Motion emergence refinement

## Transition Outcome

If the required evidence is complete and governance accepts that evidence:

`Create/UI Reference Implementation v1`

`FROZEN`

## Next Phase

After freezing, the next lane is:

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

The milestone sequence is:

Create/UI freezes as the first reference implementation.

Graphic proves reusability.
