'use client';

import { useEffect, useRef } from 'react';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { canvasBus } from '@/ui/canvasBus';

export function useKeyboardNudge({ enabled = true, emit, getState }) {
  const { selectedIds } = useSelection();
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

      const base = e.shiftKey && e.altKey ? 5 : e.shiftKey ? 10 : e.altKey ? 0.5 : 1;

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

      selectedIds.forEach((id) => {
        const node = nodes[id];
        if (!node) return;

        const layout = node.layout || {};

        emit?.({
          type: 'node.layout.move',
          payload: {
            nodeId: id,
            x: (layout.x || 0) + dx,
            y: (layout.y || 0) + dy,
          },
        });
      });
    }

    function onKeyUp(e) {
      if (!e.key.startsWith('Arrow')) return;
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
  }, [enabled, selectedIds, emit, getState]);
}
