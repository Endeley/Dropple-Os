import { ValidationIssueRow } from './ValidationIssueRow';
import { EXPORT_GATE_STATUS } from '@/runtime/export/exportGateStatus';

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
    >
      {title}
    </div>
  );
}

export function SheetIssues({ blockingIssues: criticalIssues = [], warnings = [], status }) {
  const showCritical = status === EXPORT_GATE_STATUS.HALT && criticalIssues.length > 0;
  const showWarnings = warnings.length > 0;
  const showNoCriticalNotice = status === EXPORT_GATE_STATUS.WARN && criticalIssues.length === 0;

  if (!showCritical && !showWarnings) {
    return (
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-2)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <SectionHeader title="Critical issues" />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          No critical issues or warnings.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--space-3)',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {showCritical && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <SectionHeader title="Critical issues" />
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Resolve these issues before export.
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {criticalIssues.map((issue) => (
              <ValidationIssueRow key={issue.id || issue.message} issue={issue} />
            ))}
          </div>
        </div>
      )}
      {showNoCriticalNotice && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          No critical issues detected.
        </div>
      )}
      {showWarnings && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <SectionHeader title="Warnings" />
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Warnings may affect quality.
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {warnings.map((issue) => (
              <ValidationIssueRow key={issue.id || issue.message} issue={issue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
