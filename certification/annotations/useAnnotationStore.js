'use client';

import { createContext, useContext, useState } from 'react';

const AnnotationContext = createContext(null);

export function AnnotationProvider({ children }) {
  const [annotations, setAnnotations] = useState([]);

  function addAnnotation(annotation) {
    setAnnotations((current) => [...current, annotation]);
  }

  function getAnnotationsForSubmission(submissionId) {
    return annotations.filter((a) => a.submissionId === submissionId);
  }

  return (
    <AnnotationContext.Provider
      value={{ annotations, addAnnotation, getAnnotationsForSubmission }}
    >
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotations() {
  return useContext(AnnotationContext);
}
