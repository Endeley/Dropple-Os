'use client';

import { useEffect } from 'react';
import { serializeSelection } from '@/ui/workspace/shared/serializeSelection';
import { pasteFromClipboard } from '@/ui/workspace/shared/pasteFromClipboard';
import { useClipboard } from '@/ui/workspace/shared/ClipboardContext';

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
    function onKeyDown(e) {
      const isMac = navigator.platform.includes('Mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const snapshot = serializeSelection({
          state: getState(),
          selectedIds,
        });
        clipboard.copy(snapshot);
        return;
      }

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelection();
        return;
      }

      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const newIds = pasteFromClipboard({
          clipboard: clipboard.clipboard,
          emit,
        });
        setSelection(new Set(newIds));
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelection();
      }
    }

    function deleteSelection() {
      selectedIds.forEach((id) => {
        emit({
          type: 'node.delete',
          payload: { nodeId: id },
        });
      });
    }

    function duplicateSelection() {
      const state = getState();
      selectedIds.forEach((id) => {
        const node = state.nodes[id];
        if (!node) return;

        const newId = `${id}-copy`;

        emit({
          type: 'node.create',
          payload: {
            nodeId: newId,
            nodeType: node.type,
            parentId: node.parentId || null,
            layout: {
              x: node.layout.x + 20,
              y: node.layout.y + 20,
              width: node.layout.width,
              height: node.layout.height,
            },
            initialProps: { ...node.props },
          },
        });
      });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, selectedIds, setSelection, emit, undo, redo, getState, clipboard]);
}
