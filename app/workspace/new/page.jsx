'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { mockTemplates } from '@/marketplace/mockTemplates';
import { createWorkspaceFromTemplate } from '@/workspace/createFromTemplate';

function createEmptyWorkspace() {
  return {
    id: crypto.randomUUID(),
    mode: 'design',
    snapshot: null,
    events: [],
    forkedFrom: null,
  };
}

export default function WorkspaceNewPage() {
  const searchParams = useSearchParams();
  const fromTemplate = searchParams.get('fromTemplate');

  const workspace = useMemo(() => {
    const template = mockTemplates.find((t) => t.id === fromTemplate);
    return template ? createWorkspaceFromTemplate(template) : createEmptyWorkspace();
  }, [fromTemplate]);

  const initialCursorIndex = workspace.events.length
    ? workspace.events.length - 1
    : -1;

  return (
    <WorkspaceShell
      modeId={workspace.mode}
      initialEvents={workspace.events}
      initialCursorIndex={initialCursorIndex}
      disableSeed={workspace.events.length > 0}
    />
  );
}
