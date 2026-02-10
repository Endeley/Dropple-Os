'use client';

import { useState } from 'react';
import { colors, spacing, radius } from '@/ui/tokens';

function Row({ label, value, onCopy }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
        fontSize: 12,
        color: colors.text,
      }}
    >
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
        <span>{value ?? '—'}</span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: radius.sm,
              background: '#fff',
              fontSize: 10,
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            Copy
          </button>
        )}
      </span>
    </div>
  );
}

export function NodeHeaderPanel({ node, parentId, childCount }) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    const id = node?.id;
    if (!id) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 900);
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      <Row label="Node Type" value={node?.type} />
      <Row
        label="Node ID"
        value={copied ? 'Copied' : node?.id}
        onCopy={copyId}
      />
      <Row label="Parent ID" value={parentId} />
      <Row label="Children" value={childCount} />
    </div>
  );
}
