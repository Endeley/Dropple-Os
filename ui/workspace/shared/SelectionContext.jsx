'use client';

import { createContext, useContext, useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import {
  SELECTION_ADD,
  SELECTION_CLEAR,
  SELECTION_REMOVE,
  SELECTION_SET,
} from '@/core/events/selectionEvents.js';

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const selectionIds = useRuntimeStore((s) => s.selection?.ids || []);
  const selectedIds = useMemo(() => new Set(selectionIds), [selectionIds]);
  const { dispatch } = useDispatcher();

  function selectSingle(id) {
    if (!id) return;
    dispatch({ type: SELECTION_SET, payload: { ids: [id] } });
  }

  function setSelection(ids) {
    const nextIds = Array.from(ids || []);
    dispatch({ type: SELECTION_SET, payload: { ids: nextIds } });
  }

  function toggle(id) {
    if (!id) return;
    if (selectedIds.has(id)) {
      dispatch({ type: SELECTION_REMOVE, payload: { id } });
      return;
    }
    dispatch({ type: SELECTION_ADD, payload: { id } });
  }

  function clear() {
    dispatch({ type: SELECTION_CLEAR });
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
