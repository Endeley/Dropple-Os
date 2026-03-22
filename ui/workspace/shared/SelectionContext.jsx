'use client';

import { createContext, useContext, useMemo } from 'react';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const selectionIds = useWorkspaceVisualState((s) => s.selection?.ids || []);
  const selectedIds = useMemo(() => new Set(selectionIds), [selectionIds]);

  function selectSingle(id) {
    if (!id) return;
    canvasBus.emit('intent.selection.select', { nodeId: id });
  }

  function setSelection(ids) {
    const nextIds = Array.from(ids || []);
    canvasBus.emit('intent.selection.set', { ids: nextIds, primary: nextIds[0] ?? null });
  }

  function toggle(id) {
    if (!id) return;
    canvasBus.emit('intent.selection.toggle', { nodeId: id });
  }

  function clear() {
    canvasBus.emit('intent.selection.clear', {});
  }

  return (
    <SelectionContext.Provider
      value={{ selectedIds, selectSingle, toggle, clear, setSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  return useContext(SelectionContext);
}
