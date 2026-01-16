'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

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

  return <WorkspaceShell modeId="design" {...options} />;
}
