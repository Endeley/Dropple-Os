'use client';

import { useMemo } from 'react';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import {
  getNodes,
  getRootIds,
  getSceneGraph,
} from '@/runtime/document/documentAdapter.js';

export function useReplayState({ events, cursor }) {
  const cursorIndex = cursor?.index ?? -1;

  return useMemo(() => {
    if (!events || cursorIndex < 0) {
      return { nodes: {}, rootIds: [], sceneGraph: null };
    }

    const state = getDesignStateAtCursor({
      events,
      uptoIndex: cursorIndex,
    });

    return {
      ...state,
      nodes: getNodes(state),
      rootIds: getRootIds(state),
      sceneGraph: getSceneGraph(state),
    };
  }, [events, cursorIndex]);
}
