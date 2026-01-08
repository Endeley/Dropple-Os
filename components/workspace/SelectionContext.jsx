'use client';

import { createContext, useContext, useState } from 'react';

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  function select(id) {
    setSelectedIds(new Set([id]));
  }

  function clear() {
    setSelectedIds(new Set());
  }

  function toggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <SelectionContext.Provider value={{ selectedIds, select, clear, toggle }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used inside SelectionProvider');
  return ctx;
}
