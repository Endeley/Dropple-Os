'use client';

import { colors, radius, spacing } from '@/ui/tokens';

export default function TemplateCard({ template, onOpen }) {
  const { metadata } = template;
  const creator = metadata.creator || {};

  return (
    <div
      onClick={() => onOpen(template)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
      }}
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: spacing.md,
        cursor: 'pointer',
        background: colors.panelBg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xs,
        transition: 'border-color 120ms ease',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600 }}>{metadata.title}</div>
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        {metadata.description}
      </div>
      <div style={{ marginTop: spacing.xs, fontSize: 11, color: colors.textMuted }}>
        By {creator.name || 'Unknown'}
        {creator.region ? ` · ${creator.region}` : ''}
      </div>
    </div>
  );
}
