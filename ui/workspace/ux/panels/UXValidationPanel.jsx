'use client';

import { useMemo } from 'react';
import { useValidationIssues } from '@/ui/canvas/validation/useValidationIssues.js';

const SEVERITY_ORDER = {
  error: 0,
  warning: 1,
  info: 2,
};

export function UXValidationPanel() {
  const issues = useValidationIssues();
  const sorted = useMemo(() => sortIssues(issues), [issues]);

  if (!sorted.length) {
    return (
      <div style={{ fontSize: 12, color: '#64748b' }}>
        No validation issues.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {sorted.map((issue) => (
        <div
          key={issue.id}
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
              {issue.ruleId}
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
              {issue.severity}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#334155' }}>{issue.message}</div>
          {issue.explain && (
            <div style={{ fontSize: 11, color: '#64748b' }}>{issue.explain}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function sortIssues(list = []) {
  return [...list].sort((a, b) => {
    const aOrder = SEVERITY_ORDER[a.severity] ?? 3;
    const bOrder = SEVERITY_ORDER[b.severity] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  });
}
