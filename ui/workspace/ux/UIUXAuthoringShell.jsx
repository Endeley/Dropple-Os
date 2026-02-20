'use client';
import { useCallback } from 'react';
import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';
import { PanelRenderer } from '@/ui/workspace/shell/PanelRenderer.jsx';
import { WorkspaceSessionsRoot } from '@/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';
import { useDispatcher } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useSelectionStore } from '@/runtime/stores/useSelectionStore.js';

/**
 * UIUXAuthoringShell
 *
 * Authoring UX / UI workspace.
 * Allowed to mount input/session bindings and emit intents.
 */
export function UIUXAuthoringShell({ profile = 'uiux-authoring' }) {
  const dispatcher = useDispatcher();
  const emit = useCallback((event) => dispatcher.dispatch(event), [dispatcher]);
  const nodes = useRuntimeStore((s) => s.nodes || {});
  const selectedIds = useSelectionStore((s) => s.selectedIds || []);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const node = selectedId ? nodes[selectedId] : null;

  return (
    <div className="uiux-root" data-workspace="uiux">
      <UIUXTopBar />
      <div className="uiux-main">
        <UIUXToolRail />
        <UIUXCanvasStage profile={profile} />
        <PanelRenderer workspaceId="uiux" node={node} emit={emit} />
      </div>
      <WorkspaceSessionsRoot />
    </div>
  );
}
