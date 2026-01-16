'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { useDocumentRole } from '@/collab/useDocumentRole';

export default function DesignWorkspaceClient() {
  const params = useSearchParams();
  const docId = params.get('doc');
  const fromGallery = params.get('from') === 'gallery';
  const role = useDocumentRole(docId);
  const readOnly = role === 'viewer';

  const options = useMemo(
    () => ({
      initialDocumentId: fromGallery ? docId : null,
      skipDraftRestore: fromGallery,
      disableSeed: fromGallery,
      readOnly,
      documentRole: role,
    }),
    [docId, fromGallery, readOnly, role]
  );

  return <WorkspaceShell modeId="design" {...options} />;
}
