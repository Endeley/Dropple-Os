# Dropple Project-First Workspace Audit and Implementation Roadmap

Date: 2026-05-30

## Audit Summary (Current State)

Dropple is already constitutionally structured for a Project-first UX shell:

- Canonical workspace substrate exists and is stable:
  - `design`, `media`, `build`, `system`, `collaborate`
  - Source: `platform/workspaces/canonicalRegistry.js`
- Canonical mode taxonomy exists with 15 modes and guards:
  - Source: `platform/workspaces/canonicalRegistry.js`
- Compatibility aliases are active and deterministic:
  - Source: `platform/workspaces/modeResolution.js`
- Overlay registry already supports domain overlays, including:
  - `systems-engineering`, `enterprise-operations`
  - Source: `platform/workspaces/overlayRegistry.js`
- App route coverage already includes expanded build overlays:
  - `/workspace/systems-engineering`
  - `/workspace/enterprise-operations`
  - Evidenced by route smoke output.

Conclusion: no substrate rewrite is needed before Project-first UI work.

## Risks To Control During UI Build

1. Leaking architecture nouns into product UX:
   - exposing `system`/`workspace` vocabulary directly to users.
2. Route fan-out drift:
   - perspective routes becoming hardcoded separately from canonical mode resolution.
3. Overlay behavior divergence:
   - overlays feeling like separate products instead of capability specializations.
4. Truth model bypass:
   - direct state writes from UI layers instead of dispatcher/event path.
5. Release-trust blind spots:
   - project shell navigation changes not represented in release gates.

## Strict Implementation Plan

Execution must follow `docs/ROADMAP_STATE_PROJECT_WORKSPACE.json` via:

- `npm run implementation:navigator:project`

Phases:

- P0: Project Shell Governance Lock
- P1: Project Context Envelope
- P2: Perspective Router
- P3: Create Perspective Binding
- P4: Build + Operate Perspective Binding
- P5: Collaborate + Publish Perspective Binding
- P6: Project UX Hardening
- P7: Production Readiness

Each phase has explicit command gates and dependency ordering.

## Immediate Start Point

Start at P0:

1. `npm run implementation:navigator:project -- --phase P0 --dry-run`
2. run gates in order.
3. update roadmap state status only after all gates pass.
