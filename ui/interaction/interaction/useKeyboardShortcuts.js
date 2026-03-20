'use client';

import { useEffect } from 'react';
import { serializeSelection } from '@/ui/workspace/shared/serializeSelection';
import { pasteFromClipboard } from '@/ui/workspace/shared/pasteFromClipboard';
import { useClipboard } from '@/ui/workspace/shared/ClipboardContext';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';
import { handleKeyboardEvent } from '@/ui/bridges/keyboardEngineFacade.js';

export function useKeyboardShortcuts({
  enabled = true,
  selectedIds,
  setSelection,
  emit,
  undo,
  redo,
  getState,
}) {
  const clipboard = useClipboard();

  useEffect(() => {
    if (!enabled) return;
    function deleteSelection() {
      selectedIds.forEach((id) => {
        emit({
          type: 'node.delete',
          payload: { nodeId: id },
        });
      });
    }

    function onKeyDown(e) {
      handleKeyboardEvent(e, {
        fallbackHandler(input) {
          const isMac = navigator.platform.includes('Mac');
          const mod = isMac ? input.modifiers.meta : input.modifiers.ctrl;

          if (mod && input.key.toLowerCase() === 'c') {
            e.preventDefault();
            const snapshot = serializeSelection({
              state: getState(),
              selectedIds,
            });
            clipboard.copy(snapshot);
            return { handled: true };
          }

          if (mod && input.key === 'z' && !input.modifiers.shift) {
            e.preventDefault();
            undo();
            return { handled: true };
          }

          if (mod && input.key === 'z' && input.modifiers.shift) {
            e.preventDefault();
            redo();
            return { handled: true };
          }

          if (mod && input.key.toLowerCase() === 'd') {
            e.preventDefault();
            duplicateSelection();
            return { handled: true };
          }

          if (mod && input.key.toLowerCase() === 'v') {
            e.preventDefault();
            const newIds = pasteFromClipboard({
              clipboard: clipboard.clipboard,
              emit,
            });
            setSelection(new Set(newIds));
            return { handled: true };
          }

          if (input.key === 'Delete' || input.key === 'Backspace') {
            e.preventDefault();
            deleteSelection();
            return { handled: true };
          }

          return null;
        },
      });
    }

    function duplicateSelection() {
      const state = getState();
      selectedIds.forEach((id) => {
        const node = state.nodes[id];
        if (!node) return;

        const newId = `${id}-copy`;

        nodeCreateIntent({
          id: newId,
          type: node.type,
          parentId: node.parentId || null,
          props: { ...node.props },
          bounds: {
            x: node.layout.x + 20,
            y: node.layout.y + 20,
            width: node.layout.width,
            height: node.layout.height,
          },
        });
      });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, selectedIds, setSelection, emit, undo, redo, getState, clipboard]);
}
