'use client';
import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';
import { UIUXRightPanel } from './UIUXRightPanel.jsx';
import { WorkspaceSessionsRoot } from '@/workspace/WorkspaceRoot/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';

/**
 * UIUXAuthoringShell
 *
 * Authoring UX / UI workspace.
 * Allowed to mount input/session bindings and emit intents.
 */
export function UIUXAuthoringShell({ profile = 'uiux-authoring' }) {
  return (
    <div className="uiux-root" data-workspace="uiux">
      <UIUXTopBar />
      <div className="uiux-main">
        <UIUXToolRail />
        <UIUXCanvasStage profile={profile} />
        <UIUXRightPanel />
      </div>
      <WorkspaceSessionsRoot />
    </div>
  );
}
