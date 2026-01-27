# Phase A UX (Locked)

Phase A UX is complete and locked as a read-only insight layer.

## Purpose
- Provide passive UX insight from existing runtime data.
- No simulation, previews, or edits.

## Allowed (Phase A)
- Replay-derived state (`getDesignStateAtCursor`).
- Read-only dispatcher signals (UX audit log).
- Passive panels that render insights.

## Forbidden (Phase A)
- Emitting events or mutating state.
- Canvas behavior changes.
- New data sources outside replay + read-only UX signals.
- Interactive controls or editor tools.

## Locked Files
- `ui/workspace/ux/UXWorkspaceShell.jsx`
- `ui/workspace/ux/UXInspectorPanel.jsx`
- `ui/workspace/ux/panels/UXEventListPanel.jsx`
- `ui/workspace/ux/panels/UXSelectionInsightPanel.jsx`
- `ui/workspace/ux/panels/UXRiskImpactPanel.jsx`

## Phase B Note
All canvas behavior changes start in Phase B. Any change to the locked files
requires explicit Phase B approval.
