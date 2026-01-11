# [Phase 2] PR — Transition Export Mapping

## Linked Issue
Closes #____

> ⚠️ Export PRs are high risk. Expect slow review.

---

## Scope Declaration

- [ ] Export derives from **state + transition data only**
- [ ] Output is deterministic and diffable
- [ ] No DOM-based export
- [ ] No preview-based export

---

## Export Formats Affected

- [ ] CSS
- [ ] WAAPI
- [ ] Other (explain)

---

## Mapping Explanation (Required)

Explain how:
- States map to exported structure
- Transitions map to exported transitions
- Properties are selected

---

## Verification Checklist

- [ ] Export diff reflects only transition changes
- [ ] Export output normalized
- [ ] No implicit animation generated
- [ ] Replay matches export behavior

---

## Reviewer Warning

If export output surprises a developer, this PR is wrong.
