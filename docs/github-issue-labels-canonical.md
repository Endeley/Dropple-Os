# Dropple — GitHub Issue Labels (Canonical)

Clean, practical labels optimized for a solo dev and aligned with locked architecture.

---

## Priority Labels (only one per issue)
- **P0-critical** — Must be done before anything else. Blocks progress.
- **P1-high** — Required for v1 quality and trust. Do soon after P0.
- **P2-medium** — Important but not blocking.
- **P3-later** — Parked for future milestones.

---

## Type Labels (one or two per issue)
- **core** — Fundamental system or architecture work
- **uiux** — User-facing UI/UX behavior
- **dropple-custom** — Dropple-only systems (Ghost Preview, Intent, Time, etc.)
- **safety** — Guards, invariants, mutation prevention
- **data-model** — Schemas, contracts, metadata
- **infra** — Plumbing, wiring, registries, engines

---

## Capability Labels (optional but powerful)
- **capability-driven** — Issue depends on capability rules
- **read-only** — Must not mutate state
- **write-path** — Introduces or modifies mutation logic

---

## Workspace Scope Labels
- **workspace-uiux** — UIUX workspace only
- **workspace-global** — Applies across workspaces
- **workspace-template** — Template-specific behavior

---

## Ghost / Preview Labels
- **ghost-preview** — Uses illusion layer
- **no-mutation** — Hard guarantee: no state change

---

## Quality & Trust Labels
- **trust-critical** — User trust depends on this
- **deterministic** — Must be replay-safe / predictable

---

## Solo-Dev Management Labels
- **solo-friendly** — Can be done in one sitting
- **needs-design-review** — Pause before coding
- **do-not-rush** — Architectural risk if rushed

---

## Example Labeling (Tier 1 + Tier 2)

**Issue: Define Template Metadata Model**
- `P0-critical`
- `core`
- `data-model`
- `workspace-template`
- `capability-driven`
- `solo-friendly`

**Issue: Ghost Preview on Template Hover**
- `P1-high`
- `dropple-custom`
- `ghost-preview`
- `no-mutation`
- `trust-critical`
- `do-not-rush`

**Issue: Template Mutation Guard**
- `P1-high`
- `safety`
- `core`
- `deterministic`
- `trust-critical`
- `do-not-rush`

---

## Labeling Rules (Important)
- Every issue must have exactly one Priority label
- Every issue must have at least one Type label
- Anything touching Ghost Preview must include `no-mutation`
- Anything touching templates must include `workspace-template`
- If you hesitate → add `needs-design-review` and stop

---

## Why this works for a solo dev
- You always know what to work on next
- You can pause safely
- You won’t accidentally mix concerns
- Future contributors won’t break invariants
- Your repo becomes self-documenting
