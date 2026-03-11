'use client';

import { createContext, useContext, useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { clearSelection } from '@/runtime/selection/clearSelection.js';
import { setSelection as createSetSelection } from '@/runtime/selection/setSelection.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const selectionIds = useRuntimeStore((s) => s.selection?.ids || []);
  const selectedIds = useMemo(() => new Set(selectionIds), [selectionIds]);
  const { dispatch } = useDispatcher();

  function selectSingle(id) {
    if (!id) return;
    dispatch(selectNode(id));
  }

  function setSelection(ids) {
    const nextIds = Array.from(ids || []);
    dispatch(createSetSelection(nextIds));
  }

  function toggle(id) {
    if (!id) return;
    dispatch(toggleNode(id));
  }

  function clear() {
    dispatch(clearSelection());
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
