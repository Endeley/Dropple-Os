# [Phase 2] PR — Transition Preview (Read-Only)

## Linked Issue
Closes #____

---

## Scope Declaration

- [ ] Preview only
- [ ] No events emitted
- [ ] No state mutation
- [ ] No undo/redo interaction

---

## Preview Rules Verified

- [ ] Preview always reverts
- [ ] Preview applies transitions correctly
- [ ] Preview does not affect persistence

---

## How Preview Works (Explain)

Briefly describe:
- How preview state is derived
- How it is discarded
- Why it cannot leak into truth

---

## Verification Checklist

- [ ] Replay unaffected
- [ ] Undo/redo unaffected
- [ ] Export unaffected

---

## Reviewer Guidance

Preview must remain illusion.  
If preview commits truth, this PR must be rejected.
