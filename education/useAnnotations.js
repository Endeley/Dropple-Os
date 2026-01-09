import { useState } from 'react';

export function useAnnotations() {
  const [annotations, setAnnotations] = useState([]);

  function addAnnotation(annotation) {
    setAnnotations((a) => [...a, annotation]);
  }

  return { annotations, addAnnotation };
}
