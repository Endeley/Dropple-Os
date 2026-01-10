'use client';

import { createContext, useContext, useState } from 'react';

const EducationCursorContext = createContext(null);

export function EducationCursorProvider({
  children,
  role = 'teacher',
  initialLocked = true,
}) {
  const [locked, setLocked] = useState(initialLocked);

  return (
    <EducationCursorContext.Provider value={{ locked, setLocked, role }}>
      {children}
    </EducationCursorContext.Provider>
  );
}

export function useEducationCursor() {
  return useContext(EducationCursorContext);
}
