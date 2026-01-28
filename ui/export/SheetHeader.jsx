import { colors, spacing } from '@/ui/tokens';

const STATUS_STYLES = {
  block: {
    label: 'Blocked',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
    subtitle: "Export can't proceed due to UX errors.",
  },
  warn: {
    label: 'Warnings present',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    subtitle: 'Export has warnings. You can proceed if you choose.',
  },
};

export function SheetHeader({ status, onCancel }) {
  const tone = STATUS_STYLES[status] || STATUS_STYLES.warn;

  return (
    <div
      style={{
        display: 'grid',
        gap: spacing.sm,
        paddingBottom: spacing.md,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: colors.text }}>
          Export review
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 999,
            background: tone.bg,
            border: `1px solid ${tone.border}`,
            color: tone.text,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {tone.label}
        </span>
        {onCancel && (
          <button
            type="button"
            aria-label="Cancel export"
            onClick={onCancel}
            style={{
              marginLeft: spacing.xs,
              width: 28,
              height: 28,
              borderRadius: 999,
              border: `1px solid ${colors.border}`,
              background: 'transparent',
              color: colors.textMuted,
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: '24px',
            }}
          >
            ✕
          </button>
        )}
      </div>
      <div style={{ fontSize: 12, color: colors.textMuted }}>{tone.subtitle}</div>
    </div>
  );
}
