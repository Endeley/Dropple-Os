# UI Workspaces Implementation Roadmap

Status: execution governance  
Authority: subordinate to `docs/LAW.md`

## Purpose

This roadmap governs post-project-shell implementation of user-facing workspace experiences while preserving constitutional routing and mutation lawfulness.

Progression is fail-closed:

1. no phase advancement without dependency closure
2. no phase marked complete without gate pass
3. no UI workspace behavior may bypass dispatcher/event authority

## Phase Order

1. `U0` UI Workspace Governance Lock
2. `P0` Pre-UI Hardening Lock
3. `U1` Workspace Shell Foundation
4. `U2` Design Workspace Experience
5. `U3` Media Workspace Experience
6. `U4` Build Workspace Experience
7. `U5` System Workspace Experience
8. `U6` Collaborate Workspace Experience
9. `U7` Workspace Production Hardening

## U1 Assistant Milestones

Tracked inside `docs/ROADMAP_STATE_UI_WORKSPACES.json` under `U1.milestones`:

1. `U1.A1` Assistant Runtime Contract and Registry
2. `U1.A2` Dispatcher-Only Assistant Request Routing
3. `U1.A3` Perspective Adapters and OS Surface Projection
4. `U1.A4` Perspective-Scoped Assistant Action Policy

All `U1.A*` milestones are backend-only and non-sovereign:

- no direct document/runtime truth mutation
- dispatcher remains the only mutation authority
- assistant availability in UI must route through OS surface read bridge

## U2 Design Milestones

Tracked inside `docs/ROADMAP_STATE_UI_WORKSPACES.json` under `U2.milestones`:

1. `U2.D1` Design Perspective Navigation and Entry Cohesion
2. `U2.D2` Design Mode Shell Parity (`uiux`, `graphic`, `document`)
3. `U2.D3` Design Overlay Compatibility (`branding`, `icons` aliases)
4. `U2.D4` Design Assistant UX Consistency in Create Perspective

All `U2.D*` milestones must preserve constitutional boundaries:

- no workspace UI may mutate canonical truth directly
- all authoring mutations remain dispatcher/event owned
- overlay compatibility remains routing/capability policy, not new authority

## Runtime Control

Use:

- `npm run implementation:navigator:ui-workspaces`
- `npm run implementation:navigator:ui-workspaces -- --phase U2 --dry-run`
- `npm run implementation:navigator:ui-workspaces -- --json`

Source of truth:

- `docs/ROADMAP_STATE_UI_WORKSPACES.json`
