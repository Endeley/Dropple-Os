# ARR2.0 Foundation Cleanup Execution Report

Status: OPEN - Pending Creator Validation  
Phase: ARR2.0 Foundation Cleanup  
Authority: Subordinate to `FIRST_WORLD_WORLD_RENDERER_CONTRACT.md` and ARR2.0 governance  
Date: July 21, 2026

## Scope

ARR2.0 executed as a removal-only pass against current presentation ownership files.  
No reconstruction, redesign, or Phase 2 work was introduced.

Presentation Ownership Files:

- `ui/first-world/WorldRenderer.jsx`
- `app/ProjectHomeClient.jsx`
- `app/ProjectHomeClient.module.css`
- `tests/e2e/workspace-routes.smoke.spec.js`

## Deletion Record

| File | Removed Element | Homepage Assumption | ARR2.0 Law | Architectural Impact | Replacement |
|---|---|---|---|---|---|
| `ui/first-world/WorldRenderer.jsx` | Centered arrival intro block (`Arrival · Home Plaza`, hero heading, explanatory copy) | User must read before orienting | `Remove Presentation Ownership`, `No UI Before Orientation` | Renderer boundary, navigation authority, camera, projection, routing, and world identity unchanged | `NONE` |
| `ui/first-world/WorldRenderer.jsx` | Interactive landmark card cluster | Home should explain itself through equal-weight UI panels | `Remove Presentation Ownership`, `Reduce to World Primitives` | WorldRenderer still projects Home; district and landmark identities unchanged | `NONE` |
| `ui/first-world/WorldRenderer.jsx` | CTA-bearing landmark actions (`Explore Languages`, `Resume active context`, `Meet the Community`, marketplace CTA) in the first frame | Decision should precede orientation | `No UI Before Orientation`, `No Replacement` | NavigationFramework remains sole navigation authority; no travel or routing ownership moved | `NONE` |
| `ui/first-world/WorldRenderer.jsx` | Fixed continuity panel with recent-project surface | First frame should prioritize product explanation and return-task prompting | `Remove Presentation Ownership`, `No UI Before Orientation` | Renderer, camera, projection, and world coordinates unaffected | `NONE` |
| `ui/first-world/WorldRenderer.jsx` | Footer messaging and footer CTA | First frame should end with webpage-style supporting copy | `Remove Presentation Ownership`, `No Replacement` | No impact below presentation layer | `NONE` |
| `app/ProjectHomeClient.jsx` | Recent-project and active-document loading for first-frame presentation | Home arrival should surface return-context UI immediately | `Remove Presentation Ownership`, `No Replacement` | Composition root still wires LivingWorldHost -> WorldCore -> RegionHost -> NavigationFramework -> WorldRenderer | `NONE` |
| `app/ProjectHomeClient.jsx` | `continueRoute` wiring into `WorldRenderer` | Home arrival should foreground CTA routing | `No UI Before Orientation`, `No Replacement` | Routing model unchanged; only removed from first-frame presentation | `NONE` |
| `app/ProjectHomeClient.module.css` | Hero typography hierarchy | Home should behave like a landing-page hero | `Remove Presentation Ownership` | No change to camera, projection, world coordinates, or navigation | `NONE` |
| `app/ProjectHomeClient.module.css` | Card-grid landmark styling | Home landmarks should compete as equal UI surfaces | `Reduce to World Primitives`, `No Replacement` | Landmark identities preserved as spatial anchors only | `NONE` |
| `app/ProjectHomeClient.module.css` | Continuity panel styling | First frame should foreground panelized return-state UI | `Remove Presentation Ownership`, `No Replacement` | None below presentation layer | `NONE` |
| `app/ProjectHomeClient.module.css` | Footer/marketing support styling | First frame should contain webpage-style explanatory footer content | `Remove Presentation Ownership`, `No Replacement` | None below presentation layer | `NONE` |
| `tests/e2e/workspace-routes.smoke.spec.js` | ARR1-era CTA and panel assertions | Home contract still depends on removed homepage-era presentation | `Preserve World Ownership` | Architectural protections remain; tests now assert preserved world/authority behavior only | `NONE` |

## Remaining Authoritative Rendering Path

`NavigationFramework destination truth -> one camera -> fixed world coordinates -> one projection model -> one visible world`

ARR2.0 did not alter this path.

## Technical Validation

Passed:

- `npm run test:architecture`
- Focused Playwright smoke validation for home-route architecture and world rendering authority:
  - root load
  - First World identity
  - canonical language entry links
  - invalid hash fail-closed
  - active/nearby/distant projection contract
  - navigation-authority travel request
  - distinct region identities

## Constitutional Compliance

PASS

Confirmed unchanged:

- One renderer remains
- One navigation authority remains
- One camera authority remains
- One projection path remains
- Frozen ownership below presentation layer remains unchanged

## Phase Containment

Cross-Phase Bleed: NONE

Explicitly not introduced:

- ARR2.1 geometry reconstruction: NO
- ARR2.2 landmark redesign: NO
- ARR2.3 district redesign: NO
- ARR2.4 discovery features: NO
- ARR2.5 interaction changes: NO

## Success Definition Check

ARR2.0 does not produce a finished First World.  
ARR2.0 produces a cleaner spatial foundation for ARR2.1-ARR2.5.

Current result:

- Homepage-era first-frame ownership removed
- Monument/plaza retained as near-range spatial anchor
- Distant districts remain visible as destinations
- First frame now depends less on explanation and more on place
- Reconstruction has not started

## Next Gate

ARR2.0 remains OPEN pending Creator Validation.

Required before freeze:

- Confirm the first frame feels like an unfinished place rather than an unfinished webpage
- Confirm the eye goes to world, horizon, monument, and destinations before interface
- Confirm no replacement presentation has been introduced

