'use client';

import { createContext, useContext, useState } from 'react';

const GridContext = createContext(null);

export function GridProvider({ children }) {
  const [grid, setGrid] = useState({
    enabled: false,
    size: 8,
  });

  function toggleGrid() {
    setGrid((g) => ({ ...g, enabled: !g.enabled }));
  }

  function setGridSize(size) {
    setGrid((g) => ({ ...g, size }));
  }

  return (
    <GridContext.Provider value={{ grid, toggleGrid, setGridSize }}>
      {children}
    </GridContext.Provider>
  );
}

export function useGrid() {
  return useContext(GridContext);
}
