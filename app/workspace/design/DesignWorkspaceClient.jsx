'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import {
  getWorkspaceDefinition,
  resolveWorkspaceContext,
} from '@/platform/workspaces';

export default function DesignWorkspaceClient() {
  const params = useSearchParams();
  const docId = params.get('doc');
  const fromGallery = params.get('from') === 'gallery';
  const queryMode = params.get('mode');
  const workspaceContext = useMemo(
    () =>
      resolveWorkspaceContext({
        workspace: 'design',
        mode: queryMode ?? '',
      }),
    [queryMode]
  );
  const workspace = useMemo(
    () => getWorkspaceDefinition(workspaceContext.definitionId ?? 'uiux'),
    [workspaceContext]
  );

  const options = useMemo(
    () => ({
      initialDocumentId: fromGallery ? docId : null,
      skipDraftRestore: fromGallery,
      disableSeed: fromGallery,
    }),
    [docId, fromGallery]
  );

  return (
    <WorkspaceRoot
      modeId={workspaceContext.mode ?? 'uiux'}
      workspaceId={workspaceContext.definitionId ?? 'uiux'}
      profile={workspace?.profile ?? 'design'}
      workspace={workspace}
      workspaceContext={workspaceContext}
      shellProps={options}
    />
  );
}
