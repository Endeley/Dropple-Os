'use client';

import { DispatcherProvider } from './DispatcherProvider/DispatcherProvider.jsx';
import { WorkspaceUIRoot } from './DispatcherProvider/UI/WorkspaceUIRoot.jsx';
import { WorkspaceCanvasRoot } from './DispatcherProvider/Canvas/WorkspaceCanvasRoot.jsx';
import { WorkspaceSessionsRoot } from './DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';
import { WorkspaceBridgesRoot } from './DispatcherProvider/Bridges/WorkspaceBridgesRoot.jsx';

export function WorkspaceRoot({ workspaceId = null, branchId = 'main' }) {
  return (
    <DispatcherProvider workspaceId={workspaceId} branchId={branchId}>
      <WorkspaceBridgesRoot />
      <WorkspaceSessionsRoot />
      <WorkspaceUIRoot />
      <WorkspaceCanvasRoot />
    </DispatcherProvider>
  );
}
