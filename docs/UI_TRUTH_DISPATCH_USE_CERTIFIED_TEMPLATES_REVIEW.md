# UI Truth Dispatcher Elimination — useCertifiedTemplates Review

## Candidate

`useCertifiedTemplates.js`

File:

- [ui/registry/useCertifiedTemplates.js](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/registry/useCertifiedTemplates.js:1)

## Question

Has `useCertifiedTemplates.js` earned its own dispatcher-elimination slice?

## Evaluation

### Ownership Improvement

`PASS`

This hook currently owns direct dispatcher access only to invoke template installation. Removing that access would further reduce UI ownership of runtime truth in a low-coupling utility surface.

### Runtime Authority Preservation

`PASS`

There is no evidence that template installation requires a second authority layer. The dispatcher-backed install path can be routed through the already validated runtime relay pattern while preserving runtime as the sole mutation authority.

### Behavioral Risk

`PASS`

This candidate has a limited behavioral surface. It loads template metadata and exposes an `install` callback, but it does not directly own Create World transitions, navigation, viewport control, or shell composition.

### Candidate Independence

`PASS`

`useCertifiedTemplates.js` appears independently sliceable. Its cleanup does not require concurrent changes to:

- [ui/canvas/CanvasRoot.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/canvas/CanvasRoot.jsx:1)
- [ui/workspace/shell/ProjectPerspectiveShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/shell/ProjectPerspectiveShell.jsx:1)
- [ui/workspace/uiux/UIUXAuthoringShell.jsx](/Users/endeleykonboye/Desktop/dropple-os/dropple/ui/workspace/uiux/UIUXAuthoringShell.jsx:1)

### Validation Strategy

`PASS`

Success can be verified through:

- targeted lint for `useCertifiedTemplates.js`
- architecture audit
- release operator surfaces
- focused template-install or certified-template UI flows if the existing suite already covers them

## Deferred Candidates

### MergeBranch

Deferred because:

- lower leverage than the current candidate sequencing
- can reuse patterns proven by this utility-hook cleanup

### ProjectPerspectiveShell

Deferred because:

- higher coupling to world navigation and project continuity
- deserves its own candidate review after lower-risk debt is retired

### CanvasRoot

Deferred because:

- highest constitutional sensitivity
- shared Create World substrate
- should remain the final dispatcher candidate unless new evidence lowers its risk

## Verdict

Status:

`Accepted`

## Authorization

This review authorizes a dispatcher-elimination candidate slice for:

`useCertifiedTemplates.js`
