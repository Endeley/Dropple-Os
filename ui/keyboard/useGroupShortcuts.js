'use client';

import { useEffect } from 'react';
import { runToolCommand } from '@/ui/interactions/toolController';
import { handleKeyboardEvent } from '@/ui/bridges/keyboardEngineFacade.js';

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
      handleKeyboardEvent(e, {
        fallbackHandler(input) {
          const tag = input.event?.target?.tagName;
          if (
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            input.event?.target?.isContentEditable
          ) {
            return null;
          }

          const isMac = navigator.platform.includes('Mac');
          const mod = isMac ? input.modifiers.meta : input.modifiers.ctrl;
          if (!mod || input.key.toLowerCase() !== 'g') return null;

          const state = getState?.();
          e.preventDefault();
          runToolCommand({
            commandId: input.modifiers.shift ? 'ungroup' : 'group',
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
          return { handled: true };
        },
      });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, selectedIds, emit, getState, workspaceId]);
}
