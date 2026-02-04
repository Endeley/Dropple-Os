'use client';

import '@/workspaces/modes/registerModes';
import { WorkspaceRoot } from '@/workspace/WorkspaceRoot/WorkspaceRoot.jsx';

export default function WorkspaceLayout({ children }) {
  return <WorkspaceRoot workspaceId={null} branchId="main">{children}</WorkspaceRoot>;
}
