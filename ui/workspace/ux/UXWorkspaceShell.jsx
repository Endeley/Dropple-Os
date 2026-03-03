'use client';
import { useCallback } from 'react';
import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';
import { PanelRenderer } from '@/ui/workspace/shell/PanelRenderer.jsx';
import { WorkspaceSessionsRoot } from '@/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useSelectionStore } from '@/runtime/stores/useSelectionStore.js';

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

export function UXWorkspaceShell({ profile = 'ux-validation', modeId = 'uiux' }) {
  const nodes = useRuntimeStore((s) => s.nodes || {});
  const selectedIds = useSelectionStore((s) => s.selectedIds || []);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const node = selectedId ? nodes[selectedId] : null;
  const emit = useCallback(() => {}, []);

  return (
    <div className="uiux-root" data-workspace="uiux">
      <UIUXTopBar />
      <div className="uiux-main">
        <UIUXToolRail />
        <UIUXCanvasStage profile={profile} />
        <PanelRenderer workspaceId="uiux" node={node} emit={emit} />
      </div>
      <WorkspaceSessionsRoot modeId={modeId} />
    </div>
  );
}
