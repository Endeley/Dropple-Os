# Phase 7 — Animate Between States
## Concrete Diff Plan (Implementation Sequence)

This plan defines the exact implementation sequence for Phase 7 motion
behavior. No refactors. No new systems.

---

### Diff 1 — WorkspaceLayout.jsx

Purpose: Relevance shifts, not layout animation.

We will:
- Add class/state hooks for `isRelevant` and `isActive`
- Apply <= 120ms opacity / proximity transitions
- No animation libraries

Result:
- Mode changes feel continuous
- Panels/tools fade relevance instead of popping

---

### Diff 2 — PropertyBar.jsx

Purpose: Explain selection transitions.

We will:
- Animate content change on selection (fade/slide <= 100ms)
- Preserve spatial continuity when switching nodes
- No hard content swap

---

### Diff 3 — TimelineBar.jsx

Purpose: Temporal causality.

We will:
- Animate ghost range expansion
- Animate cursor movement (slide, not jump)
- Ensure range creation feels continuous

---

### Diff 4 — Panels (LeftPanel.jsx, RightPanel.jsx)

Purpose: Context expansion and retreat.

We will:
- Animate expand/collapse from panel edge
- Collapse panels when context disappears
- Never animate without a causal trigger

---

### Diff 5 — Inline Canvas Controls

Purpose: Tool activation clarity.

We will:
- Animate affordance appearance near cursor/selection
- Fade competing tools
- Add micro confirmation motion on commit

