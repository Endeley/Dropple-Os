import { useState } from 'react';

export function useMarketplaceFilters(initialFilters = {}) {
  const [query, setQuery] = useState(initialFilters.query ?? '');
  const [mode, setMode] = useState(initialFilters.mode ?? 'all');
  const [category, setCategory] = useState(initialFilters.category ?? 'all');
  const [level, setLevel] = useState(initialFilters.level ?? 'all');
  const [tag, setTag] = useState(initialFilters.tag ?? 'all');
  const [artifactKind, setArtifactKind] = useState(initialFilters.artifactKind ?? 'all');

  return {
    query,
    setQuery,
    mode,
    setMode,
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
