'use client';

import { createContext, useContext } from 'react';

const ModeContext = createContext('graphic');

export function ModeProvider({ value, children }) {
  if (process.env.NODE_ENV === 'development' && value === 'ui') {
    throw new Error('Deprecated workspace mode "ui". Use "uiux".');
  }
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  return useContext(ModeContext);
}
