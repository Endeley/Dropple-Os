'use client';
import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';
import { UIUXRightPanel } from './UIUXRightPanel.jsx';

/**
 * UXWorkspaceShell
 *
 * PURPOSE
 * -------
 * Read-only UX / UI inspection surface.
 *
 * This shell must NEVER:
 * - emit events
 * - mutate state
 * - mount editor UI
 * - register input handlers
 * - perform persistence
 *
 * It exists solely to:
 * - observe events
 * - reconstruct state
 * - present UX-specific insights
 *
 * Phase A:
 * - Inspection only
 *
 * Phase B (future):
 * - Simulation / diff (projection-only, no authority)
 */

/* ──────────────────────────────────────────────────────────────── */
/* 🚫 HARD GUARDRAILS — DO NOT REMOVE                                */
/* ──────────────────────────────────────────────────────────────── */

/**
 * DO NOT IMPORT:
 * - WorkspaceLayout
 * - Toolbar / PropertyBar / TimelineBar
 * - emit / MessageBus / canvasBus
 * - persistence, import, export modules
 * - keyboard / interaction hooks
 * - editor tools or creation resolvers
 *
 * If you think you need one of these, STOP.
 * The architecture is being violated.
 */

/* ──────────────────────────────────────────────────────────────── */
/* ✅ ALLOWED (WHEN IMPLEMENTATION BEGINS)                           */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Allowed imports (Phase A):
 * - getDesignStateAtCursor
 * - read-only dispatcher selectors
 * - pure render helpers
 * - UX-only panels/components
 */

/* ──────────────────────────────────────────────────────────────── */
/* 🧩 PROPS CONTRACT (LOCKED)                                        */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Props (do not extend without architectural review):
 *
 * - modeId: 'uiux'
 * - events: ReadonlyArray<WorkspaceEvent>
 * - cursor: { index: number }
 * - dispatcher: read-only access only
 * - profile: 'ux-validation'
 */

export function UXWorkspaceShell() {
  return (
    <div className="uiux-root" data-workspace="uiux">
      <UIUXTopBar />
      <div className="uiux-main">
        <UIUXToolRail />
        <UIUXCanvasStage />
        <UIUXRightPanel />
      </div>
    </div>
  );
}
