'use client';

import { useMemo } from 'react';
import { useWorkspaceProjection } from '@/runtime/projection';
import { resolveAvailability } from './resolveAvailability';

export function useAvailability({ readCaps = [], writeCaps = [], modeId = null }) {
  const workspaceId = useWorkspaceProjection((state) => state.id);

  return useMemo(
    () =>
      resolveAvailability({
        workspaceId,
        modeId,
        readCaps,
        writeCaps,
      }),
    [workspaceId, modeId, readCaps, writeCaps]
  );
}
