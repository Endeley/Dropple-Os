'use client';

import { useMemo } from 'react';
import { useWorkspaceViewState } from '@/runtime/projection';
import { resolveAvailability } from './resolveAvailability';

export function useAvailability({ readCaps = [], writeCaps = [], modeId = null }) {
  const projectedWorkspace = useWorkspaceViewState((state) => state);
  const workspaceId = projectedWorkspace?.modeId ?? projectedWorkspace?.id ?? null;
  const resolvedModeId = modeId ?? projectedWorkspace?.modeId ?? null;

  return useMemo(
    () =>
      resolveAvailability({
        workspaceId,
        modeId: resolvedModeId,
        readCaps,
        writeCaps,
      }),
    [workspaceId, resolvedModeId, readCaps, writeCaps]
  );
}
