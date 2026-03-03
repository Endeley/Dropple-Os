'use client';

import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';

export default function WorkspaceLayout({ children, params }) {
  const modeId = params?.mode ?? null;
  return (
    <WorkspaceRoot workspaceId={null} branchId="main" modeId={modeId}>
      {children}
    </WorkspaceRoot>
  );
}
