import { EXPORT_GATE_STATUS } from '@/runtime/export/exportGateStatus';

const STATUS_STYLES = {
  [EXPORT_GATE_STATUS.HALT]: {
    label: 'Action required',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
    subtitle: "Export can't continue due to UX issues.",
  },
  [EXPORT_GATE_STATUS.WARN]: {
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
        gap: 'var(--space-2)',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
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
              marginLeft: 'var(--space-1)',
              width: 28,
              height: 28,
              borderRadius: 999,
              border: '1px solid var(--border-default)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: '24px',
            }}
          >
            ✕
          </button>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tone.subtitle}</div>
    </div>
  );
}
