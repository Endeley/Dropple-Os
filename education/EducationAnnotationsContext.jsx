'use client';

import { createContext, useContext } from 'react';
import { useAnnotations } from './useAnnotations';

const EducationAnnotationsContext = createContext(null);

export function EducationAnnotationsProvider({ children }) {
  const value = useAnnotations();

  return (
    <EducationAnnotationsContext.Provider value={value}>
      {children}
    </EducationAnnotationsContext.Provider>
  );
}

export function useEducationAnnotations() {
  return useContext(EducationAnnotationsContext);
}
