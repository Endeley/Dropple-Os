'use client';

import { createContext, useContext, useState } from 'react';

const ClipboardContext = createContext(null);

export function ClipboardProvider({ children }) {
  const [clipboard, setClipboard] = useState(null);

  function copy(snapshot) {
    setClipboard(snapshot);
  }

  function clear() {
    setClipboard(null);
  }

  return (
    <ClipboardContext.Provider value={{ clipboard, copy, clear }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard() {
  return useContext(ClipboardContext);
}
