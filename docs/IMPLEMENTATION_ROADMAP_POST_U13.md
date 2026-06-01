# Post-U13 Implementation Roadmap

Status: execution governance  
Authority: subordinate to `docs/LAW.md`

## Purpose

This roadmap governs post-U13 productization work with strict fail-closed phase progression:

1. no phase advancement without dependency closure
2. no phase marked complete without gate pass
3. no temporary authority paths or direct truth mutation in UI

## Phase Order

1. `P14` Project UX Hardening
2. `P15` Assistant Quality Layer
3. `P16` Blueprint Marketplace UX
4. `P17` Real User Readiness

## Runtime Control

Use:

- `npm run implementation:navigator:post-u13`
- `npm run implementation:navigator:post-u13 -- --phase P14 --dry-run`
- `npm run implementation:navigator:post-u13 -- --json`

Source of truth:

- `docs/ROADMAP_STATE_POST_U13.json`
