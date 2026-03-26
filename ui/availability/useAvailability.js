'use client';

import { useMemo } from 'react';
import { useWorkspaceViewState } from '@/runtime/projection';
import { resolveAvailability } from './resolveAvailability';

export function useAvailability({ readCaps = [], writeCaps = [], modeId = null }) {
  const workspaceId = useWorkspaceViewState((state) => state.id);

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
