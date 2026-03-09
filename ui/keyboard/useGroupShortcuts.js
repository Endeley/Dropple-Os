'use client';

import { useEffect } from 'react';
import { runToolCommand } from '@/ui/interactions/toolController';

export function useGroupShortcuts({
  enabled = true,
  selectedIds,
  emit,
  getState,
  workspaceId = 'graphic',
}) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e) {
      const tag = e.target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        e.target?.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.includes('Mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== 'g') return;

      const state = getState?.();
      e.preventDefault();
      runToolCommand({
        commandId: e.shiftKey ? 'ungroup' : 'group',
        getRuntimeState: () => ({
          workspaceId,
          document: {
            sceneGraph: {
              nodes: state?.nodes || {},
              rootIds: state?.rootIds || [],
            },
          },
          nodes: state?.nodes || {},
          rootIds: state?.rootIds || [],
          selection: {
            ids: selectedIds ? Array.from(selectedIds) : [],
          },
        }),
        dispatch: emit,
      });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, selectedIds, emit, getState, workspaceId]);
}
