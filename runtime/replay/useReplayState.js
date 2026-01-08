'use client';

import { useMemo } from 'react';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';

export function useReplayState({ events, cursor }) {
  return useMemo(() => {
    if (!events || !cursor || cursor.index < 0) {
      return { nodes: {} };
    }

    return getDesignStateAtCursor({
      events,
      uptoIndex: cursor.index,
    });
  }, [events, cursor.index]);
}
