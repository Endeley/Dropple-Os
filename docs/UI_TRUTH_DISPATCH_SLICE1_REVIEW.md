# UI Truth Dispatch Slice 1 Review

## Purpose

Review the first dispatcher-elimination candidate family against objective criteria before any implementation begins.

This document does not implement code.
It does not redesign bridges.
It does not widen scope into World Shell or Inspector Panels.

It answers one question only:

`Has Workspace Root Infrastructure earned Dispatcher Elimination Slice 1?`

## Initiative

`UI Truth Dispatcher Elimination`

## Candidate

`Dispatcher Elimination Slice 1`

## Family

`Workspace Root Infrastructure`

## Current State

Current lint evidence shows that remaining dispatcher violations are no longer scattered.

They are clustered into architectural families:

- Workspace Root Infrastructure
- World Shell
- Inspector Panels
- Utility Components

Workspace Root Infrastructure is one independent family consisting of:

- [ui/workspace/root/DispatcherProvider/Bridges/RuntimeBridgesRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/root/DispatcherProvider/Bridges/RuntimeBridgesRoot.jsx:1)
- [ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx:1)
- [ui/workspace/editor/EditorWorkspaceLayout.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/editor/EditorWorkspaceLayout.jsx:1)

Compared with World Shell, this family has:

- lower coupling to the newly validated Create World experience
- lower user-facing behavioral risk
- clearer infrastructure ownership boundaries

## Evidence Review

| Criterion | Question | Result | Notes |
| --- | --- | --- | --- |
| Ownership Improvement | Would this slice reduce UI ownership of runtime truth? | `Pass` | This family sits close to root coordination surfaces where dispatcher access is most visibly infrastructural. Removing or reclassifying UI-owned dispatcher access here would directly reduce UI truth ownership. |
| Constitutional Alignment | Does this move the repository closer to [LAW.md](/Users/endeleykonboye/Desktop/dropple-os/dropple/docs/LAW.md:1)? | `Pass` | The constitutional lint rule is already identifying these files as violations. A narrow cleanup here would move implementation closer to the law without redefining the law. |
| Runtime Risk | Can dispatcher authority remain unchanged? | `Pass` | The slice can be structured as a boundary cleanup only. Authority can remain with the dispatcher while UI-facing files reduce direct ownership. |
| Behavioral Risk | Can observable behavior remain unchanged? | `Pass` | These are infrastructure surfaces. They can be validated through route, shell, and release checks without needing experience redesign. |
| Sliceability | Can this family be implemented independently? | `Pass` | The family is cohesive enough to be handled as one infrastructure slice without widening into World Shell or Inspector Panels. |
| Validation Strategy | Can success be demonstrated through lint, architecture, release trust, and focused Playwright coverage? | `Pass` | This family already sits behind existing architecture and release gates, and focused route/shell tests can validate behavior preservation. |

## Risks

Real implementation risks for this family:

- bridge regressions
- provider lifecycle regressions
- mount-ordering regressions
- replacing direct dispatcher access with a boundary that accidentally widens rather than narrows authority

These are implementation risks, not reasons to reject the slice.

## Deferred Families

### World Shell

Deferred because:

- highest coupling
- recently validated Create World behavior
- greater behavioral risk
- should only be touched after an elimination pattern has been proven in a lower-risk family

### Inspector Panels

Deferred because:

- lower constitutional value than root infrastructure
- more appropriate after infrastructure and bridge patterns are proven
- easier to clean up once root-facing authority patterns are stable

### Utility Components

Deferred because:

- lowest architectural leverage
- likely to benefit from patterns established by earlier slices
- should not define the constitutional cleanup strategy

## Verdict

`Dispatcher Elimination Slice 1`

Status:

`Accepted`

## Authorization

This review authorizes:

`UI Truth Dispatcher Elimination — Slice 1`

Family:

`Workspace Root Infrastructure`

## Non-Authorization

This review does not authorize:

- World Shell cleanup
- Inspector Panel cleanup
- Utility Component cleanup
- dispatcher ownership redesign
- runtime contract changes
- Create World experience changes

## Closing Decision

Workspace Root Infrastructure has earned the first dispatcher-elimination validation slice.

It is the safest family to validate the cleanup pattern before touching more behaviorally sensitive areas.
