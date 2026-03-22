'use client';

import { useEffect, useRef } from 'react';
import { emitLayoutUpdate } from '@/runtime/events/emitLayoutUpdate.js';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { canvasBus } from '../eventBus/canvasBus.js';
import { handleKeyboardEvent } from '@/ui/bridges/keyboardEngineFacade.js';

export function useKeyboardNudge({ enabled = true, emit, getState }) {
  const { selectedIds } = useSelection();
  const groupActiveRef = useRef(false);

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

          if (!selectedIds || selectedIds.size === 0) return null;

          const base = input.modifiers.shift && input.modifiers.alt ? 5 : input.modifiers.shift ? 10 : input.modifiers.alt ? 0.5 : 1;

          let dx = 0;
          let dy = 0;

          switch (input.key) {
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
              return null;
          }

          e.preventDefault();

          if (!groupActiveRef.current) {
            groupActiveRef.current = true;
            canvasBus.emit('intent.edit.begin', { source: 'keyboard.nudge' });
          }

          const state = getState?.();
          const nodes = state?.nodes || {};

          emitLayoutUpdate(
            emit,
            Array.from(selectedIds)
              .map((id) => {
                const node = nodes[id];
                if (!node) return null;

                const layout = node.layout || {};

                return {
                  nodeId: id,
                  x: (layout.x || 0) + dx,
                  y: (layout.y || 0) + dy,
                };
              })
              .filter(Boolean),
          );

          return { handled: true };
        },
      });
    }

    function onKeyUp(e) {
      handleKeyboardEvent(e, {
        fallbackHandler(input) {
          if (!input.key.startsWith('Arrow')) return null;
          if (!groupActiveRef.current) return null;
          groupActiveRef.current = false;
          canvasBus.emit('intent.edit.commit', {
            type: 'move',
            ids: Array.from(selectedIds || []),
            source: 'keyboard.nudge',
          });
          return { handled: true };
        },
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
