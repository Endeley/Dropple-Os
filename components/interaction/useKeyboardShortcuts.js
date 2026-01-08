'use client';

import { useEffect } from 'react';

export function useKeyboardShortcuts({
  selectedIds,
  emit,
  undo,
  redo,
  getState,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      const isMac = navigator.platform.includes('Mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

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
  }, [selectedIds, emit, undo, redo, getState]);
}
