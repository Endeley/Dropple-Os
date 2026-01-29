'use client';

import { useMemo } from 'react';
import { useSuggestions } from '@/ui/canvas/suggestions/useSuggestions.js';

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

const KIND_LABELS = {
  ALIGN_ELEMENTS: 'Alignment',
  DENSITY_NOTICE: 'Density',
  EMPTY_VIEWPORT: 'Sparse View',
  SNAP_AVAILABLE: 'Snap Available',
  VALIDATION_ERROR: 'UX Error',
  VALIDATION_WARNING: 'UX Warning',
  VALIDATION_INFO: 'UX Notice',
};

export function UXSuggestionsPanel() {
  const suggestions = useSuggestions();
  const sorted = useMemo(() => sortSuggestions(suggestions), [suggestions]);

  if (!sorted.length) {
    return (
      <div style={{ fontSize: 12, color: '#64748b' }}>
        No suggestions yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {sorted.map((suggestion) => (
        <div
          key={suggestion.id}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '10px 12px',
            background: '#f8fafc',
            display: 'grid',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
              {KIND_LABELS[suggestion.kind] ?? suggestion.kind}
            </div>
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 999,
                border: '1px solid #e2e8f0',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {suggestion.priority ?? 'low'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#334155' }}>{suggestion.message}</div>
          <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#64748b' }}>
            <span>nodes: {suggestion.context?.nodeIds?.length ?? 0}</span>
            {suggestion.context?.region && <span>region: yes</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function sortSuggestions(list = []) {
  return [...list].sort((a, b) => {
    const aOrder = PRIORITY_ORDER[a.priority] ?? 3;
    const bOrder = PRIORITY_ORDER[b.priority] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  });
}
