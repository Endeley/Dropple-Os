'use client';

import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';

export function UIUXCanvasStage({ profile = 'ux-validation' }) {
  return (
    <main className="uiux-canvas-stage">
      <WorkspaceCanvasRoot profile={profile} />
    </main>
  );
}
