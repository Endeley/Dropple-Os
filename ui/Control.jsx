export function Control({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
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
        padding: '0 var(--space-2)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14,
        color: 'var(--text-primary)',
        background: 'var(--surface-1)',
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
        padding: '0 var(--space-2)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14,
        background: 'var(--surface-1)',
        color: 'var(--text-primary)',
      }}
    />
  );
}
