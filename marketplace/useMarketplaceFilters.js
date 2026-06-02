import { useState } from 'react';

export function useMarketplaceFilters() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [tag, setTag] = useState('all');
  const [artifactKind, setArtifactKind] = useState('all');

  return {
    query,
    setQuery,
    category,
    setCategory,
    level,
    setLevel,
    tag,
    setTag,
    artifactKind,
    setArtifactKind,
  };
}
