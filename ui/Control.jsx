import { colors, spacing, radius } from './tokens';

export function Control({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      <span style={{ fontSize: 12, color: colors.textMuted }}>{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      style={{
        height: 32,
        padding: `0 ${spacing.sm}px`,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        fontSize: 14,
      }}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      style={{
        height: 32,
        padding: `0 ${spacing.sm}px`,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        fontSize: 14,
        background: '#fff',
      }}
    />
  );
}
