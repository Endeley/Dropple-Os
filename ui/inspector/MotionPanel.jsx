'use client';

import { colors, spacing } from '@/ui/tokens';

export function MotionPanel({ node }) {
  if (!node) return null;

  const motion = node.motion || node.props?.motion || null;

  if (!motion) {
    return (
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        No motion attached.
      </div>
    );
  }

  const rows = [
    { label: 'Type', value: motion.type },
    { label: 'Duration', value: motion.duration },
    { label: 'Easing', value: motion.easing },
    { label: 'Loop', value: motion.loop },
    { label: 'Autoplay', value: motion.autoplay },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {rows.map((row) => (
        <div
          key={row.label}
          style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
        >
          <span style={{ color: colors.textMuted }}>{row.label}</span>
          <span>{row.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
