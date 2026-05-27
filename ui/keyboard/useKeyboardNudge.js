'use client';

import { useEffect, useRef } from 'react';
import { emitLayoutUpdate } from '@/runtime/events/emitLayoutUpdate.js';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { canvasBus } from '../eventBus/canvasBus.js';

export function useKeyboardNudge({
  enabled = true,
  emit,
  dispatch = null,
  getState,
  selectedIds: selectedIdsOverride = null,
}) {
  const selectionContext = useSelection();
  const selectedIdsRaw = selectedIdsOverride ?? selectionContext?.selectedIds ?? null;
  const selectedIds = selectedIdsRaw
    ? selectedIdsRaw instanceof Set
      ? selectedIdsRaw
      : new Set(selectedIdsRaw)
    : null;
  const groupActiveRef = useRef(false);

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

      if (!selectedIds || selectedIds.size === 0) return;

      const hasMod = e.metaKey || e.ctrlKey;
      if (hasMod) {
        return;
      }

      const base = e.shiftKey && e.altKey ? 10 : e.shiftKey ? 20 : e.altKey ? 1 : 5;

      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case 'ArrowLeft':
          dx = -base;
          break;
        case 'ArrowRight':
          dx = base;
          break;
        case 'ArrowUp':
          dy = -base;
          break;
        case 'ArrowDown':
          dy = base;
          break;
        default:
          return;
      }

      e.preventDefault();

      if (!groupActiveRef.current) {
        groupActiveRef.current = true;
        canvasBus.emit('intent.edit.begin', { source: 'keyboard.nudge' });
      }

      const state = getState?.();
      const nodes = state?.nodes || {};

      const updates = Array.from(selectedIds)
        .map((id) => {
          const node = nodes[id];
          if (!node) return null;

          const layout = node.layout || node;

          return {
            id,
            x: (layout.x || 0) + dx,
            y: (layout.y || 0) + dy,
          };
        })
        .filter(Boolean);

      if (updates.length > 0) {
        emitLayoutUpdate(dispatch ?? emit, updates);
      }
    }

    function onKeyUp(e) {
      if (!e.key.startsWith('Arrow')) return;
      if (e.metaKey || e.ctrlKey) return;
      if (!groupActiveRef.current) return;
      groupActiveRef.current = false;
      canvasBus.emit('intent.edit.commit', {
        type: 'move',
        ids: Array.from(selectedIds || []),
        source: 'keyboard.nudge',
      });
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, selectedIds, emit, dispatch, getState]);
}
