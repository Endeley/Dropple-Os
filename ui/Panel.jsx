import { colors, spacing } from './tokens';

export function Panel({ title, children }) {
  return (
    <div
      style={{
        background: colors.panelBg,
        borderLeft: `1px solid ${colors.border}`,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.04,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
