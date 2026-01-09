import { useState } from 'react';

export function useMarketplaceFilters() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [tag, setTag] = useState('all');

  return {
    query,
    setQuery,
    level,
    setLevel,
    tag,
    setTag,
  };
}
