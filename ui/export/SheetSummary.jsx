function SummaryItem({ label, value, tone }) {
  const tones = {
    error: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
    info: { bg: '#F1F5F9', border: '#CBD5E1', text: '#334155' },
  };
  const style = tones[tone] || tones.info;

  return (
    <div
      style={{
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-sm)',
        padding: '8px 10px',
        background: style.bg,
        display: 'grid',
        gap: 2,
      }}
    >
      <div style={{ fontSize: 10, textTransform: 'uppercase', color: style.text }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: style.text }}>{value}</div>
    </div>
  );
}

export function SheetSummary({ summary }) {
  const errorCount = summary?.errorCount ?? 0;
  const warningCount = summary?.warningCount ?? 0;
  const infoCount = summary?.infoCount ?? 0;

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--space-2)',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        Summary
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
          gap: 'var(--space-2)',
        }}
      >
        <SummaryItem label="Errors" value={errorCount} tone="error" />
        <SummaryItem label="Warnings" value={warningCount} tone="warning" />
        {infoCount > 0 && <SummaryItem label="Info" value={infoCount} tone="info" />}
      </div>
    </div>
  );
}
