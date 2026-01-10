import { useState } from 'react';

export function useLessonFilters() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [duration, setDuration] = useState('all');

  return {
    query,
    setQuery,
    level,
    setLevel,
    duration,
    setDuration,
  };
}
