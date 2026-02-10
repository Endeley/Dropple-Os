# GitHub Issue Milestones (v1 Roadmap)

These milestones are sequential and enforceable.
Each milestone can be a GitHub Milestone, and each bullet can become one or more Issues.

---

## Milestone 0 — Architecture Lock (Already Done)
**Goal:** Prevent drift before implementation.

- Capability vocabulary defined
- Workspace capability maps locked
- Tool ↔ capability classification done
- UI layer law (Left / Right / Floating) locked
- Dropple‑custom tool surface defined
- v1 UI Lock Document approved

✅ No code allowed in this milestone.

---

## Milestone 1 — Capability & Availability Engine
**Goal:** Make UI truth‑driven, not hardcoded.

**Issues**
- Add canonical capability constants
- Add workspace → capability allow‑lists
- Add mode‑based capability locks
- Add tool → required capabilities registry
- Implement availability resolver (ACTIVE / READ_ONLY / HIDDEN)

**Exit criteria**
- No tool checks workspace directly
- All visibility comes from availability resolver

---

## Milestone 2 — UIUX Workspace (Production‑Ready)
**Goal:** Ship a fully functional, trustworthy UIUX editor.

**Issues**
- Left Sidebar: intent tools wired via availability
- Right Sidebar: inspector sections gated by read/write
- Canvas selection, resize, rotate hardened
- Group / Ungroup behavior finalized
- Quick Actions (6) fully wired
- No half‑working controls visible

**Exit criteria**
- UIUX workspace can design real layouts
- No dead UI
- No hidden mutations

---

## Milestone 3 — Floating UI & Ghost Preview (v1)
**Goal:** Introduce Dropple magic without risk.

**Issues**
- Selection affordances capability‑gated
- Quick Actions palette implemented
- Ghost Preview (visual‑only, no commit)
- Hover previews for layout / intent hints

**Exit criteria**
- Ghost Preview never mutates state
- Floating UI never replaces inspector

---

## Milestone 4 — Template Creation (v1)
**Goal:** Make templates a first‑class production feature.

**Issues**
- Template creation from UIUX workspace
- Template preview using Ghost Preview
- Template metadata (states, intent, usage)
- Template save / reuse flow
- No template‑specific editor fork

**Exit criteria**
- Templates are editable like normal documents
- Templates feel “alive”, not static

---

## Milestone 5 — Read‑Only Workspaces (Shells)
**Goal:** Other workspaces feel intentional, not broken.

**Issues**
- Prototype workspace (read‑only)
- Motion workspace (read‑only)
- Inspect / Dev workspace
- Inspector read‑only enforcement

**Exit criteria**
- No mutation possible outside UIUX
- UI never lies about capability

---

## Milestone 6 — Production Hardening
**Goal:** Prepare for real users.

**Issues**
- Performance pass (canvas + inspector)
- Edge‑case handling (empty states, invalid selection)
- Error boundaries for tools
- Deterministic replay checks (intent system)
- Final UI polish
