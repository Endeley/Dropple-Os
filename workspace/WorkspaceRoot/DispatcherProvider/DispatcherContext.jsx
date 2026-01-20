'use client';

import { createContext, useContext } from 'react';

export const DispatcherContext = createContext(null);

export function useDispatcher() {
  const dispatcher = useContext(DispatcherContext);
  if (!dispatcher) {
    throw new Error(
      '[WorkspaceRoot] useDispatcher must be used under <DispatcherProvider />'
    );
  }
  return dispatcher;
}
