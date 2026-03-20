'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceShell } from '@/ui/workspace/shared/WorkspaceShell';
import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';

export default function DesignWorkspaceClient() {
  const params = useSearchParams();
  const docId = params.get('doc');
  const fromGallery = params.get('from') === 'gallery';

  const options = useMemo(
    () => ({
      initialDocumentId: fromGallery ? docId : null,
      skipDraftRestore: fromGallery,
      disableSeed: fromGallery,
    }),
    [docId, fromGallery]
  );

  return (
    <WorkspaceRoot modeId="design" workspaceId="design" profile="design">
      <WorkspaceShell modeId="design" {...options} />
    </WorkspaceRoot>
  );
}
