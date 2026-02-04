'use client';

import { WorkspaceCanvasRoot } from '@/workspace/WorkspaceRoot/DispatcherProvider/Canvas/WorkspaceCanvasRoot.jsx';

export function UIUXCanvasStage({ profile = 'ux-validation' }) {
  return (
    <main className="uiux-canvas-stage">
      <WorkspaceCanvasRoot profile={profile} />
    </main>
  );
}
