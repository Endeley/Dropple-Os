'use client';

import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';

export default function WorkspaceLayout({ children }) {
  return <WorkspaceRoot workspaceId={null} branchId="main">{children}</WorkspaceRoot>;
}
