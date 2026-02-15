'use client';

import { useMemo } from 'react';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { resolveAvailability } from './resolveAvailability';

export function useAvailability({ readCaps = [], writeCaps = [], modeId = null }) {
  const workspaceId = useWorkspaceState((state) => state.id);

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
