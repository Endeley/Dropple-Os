'use client';

import { useEffect } from 'react';
import { handleKeyboardEvent } from '@/ui/bridges/keyboardEngineFacade.js';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';

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

          e.preventDefault();
          runCommandIntent(input.modifiers.shift ? 'ungroup' : 'group');
          return { handled: true };
        },
      });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, selectedIds, emit, getState, workspaceId]);
}
