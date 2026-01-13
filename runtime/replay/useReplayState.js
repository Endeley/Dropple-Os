'use client';

import { useMemo } from 'react';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';

export function useReplayState({ events, cursor }) {
  const cursorIndex = cursor?.index ?? -1;

  return useMemo(() => {
    if (!events || cursorIndex < 0) {
      return { nodes: {} };
    }

    return getDesignStateAtCursor({
      events,
      uptoIndex: cursorIndex,
    });
  }, [events, cursorIndex]);
}
