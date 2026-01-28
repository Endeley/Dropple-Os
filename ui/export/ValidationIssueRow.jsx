'use client';

import { useState } from 'react';
import { colors, spacing, radius } from '@/ui/tokens';

const SEVERITY_STYLES = {
  error: { dot: '#F87171', text: '#991B1B', border: '#FECACA', bg: '#FEF2F2' },
  warning: { dot: '#FBBF24', text: '#92400E', border: '#FDE68A', bg: '#FFFBEB' },
  info: { dot: '#94A3B8', text: '#334155', border: '#CBD5E1', bg: '#F1F5F9' },
};

function humanizeRule(ruleId) {
  if (!ruleId) return 'Issue';
  const value = String(ruleId).replace(/_/g, ' ').toLowerCase();
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

export function ValidationIssueRow({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const tone = SEVERITY_STYLES[issue?.severity] || SEVERITY_STYLES.info;

  return (
    <div
      style={{
        border: `1px solid ${tone.border}`,
        borderRadius: radius.sm,
        padding: spacing.sm,
        background: tone.bg,
        display: 'grid',
        gap: spacing.xs,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: tone.dot,
            flexShrink: 0,
          }}
        />
        <div style={{ fontSize: 12, fontWeight: 600, color: tone.text }}>
          {humanizeRule(issue?.ruleId)}
        </div>
      </div>
      <div style={{ fontSize: 12, color: colors.text }}>{issue?.message}</div>
      {issue?.explain && (
        <div style={{ display: 'grid', gap: spacing.xs }}>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: colors.textMuted,
              fontSize: 11,
              textAlign: 'left',
              cursor: 'pointer',
            }}
            aria-expanded={expanded}
          >
            Why this matters
          </button>
          {expanded && (
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              {issue.explain}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
