'use client';

import { createContext, useContext } from 'react';

const ModeContext = createContext('graphic');

export function ModeProvider({ value, children }) {
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  return useContext(ModeContext);
}
