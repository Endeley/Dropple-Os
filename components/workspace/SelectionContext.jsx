'use client';

import { createContext, useContext, useState } from 'react';

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  function selectSingle(id) {
    setSelectedIds(new Set([id]));
  }

  function setSelection(ids) {
    setSelectedIds(new Set(ids));
  }

  function toggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clear() {
    setSelectedIds(new Set());
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
