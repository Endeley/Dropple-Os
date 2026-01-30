import { colors, spacing } from '@/ui/tokens';
import { ValidationIssueRow } from './ValidationIssueRow';
import { EXPORT_GATE_STATUS } from '@/export/exportGateStatus';

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: colors.text,
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
          gap: spacing.sm,
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <SectionHeader title="Critical issues" />
        <div style={{ fontSize: 12, color: colors.textMuted }}>
          No critical issues or warnings.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: spacing.md,
        paddingBottom: spacing.md,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {showCritical && (
        <div style={{ display: 'grid', gap: spacing.sm }}>
          <SectionHeader title="Critical issues" />
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            Resolve these issues before export.
          </div>
          <div style={{ display: 'grid', gap: spacing.sm }}>
            {criticalIssues.map((issue) => (
              <ValidationIssueRow key={issue.id || issue.message} issue={issue} />
            ))}
          </div>
        </div>
      )}
      {showNoCriticalNotice && (
        <div style={{ fontSize: 12, color: colors.textMuted }}>
          No critical issues detected.
        </div>
      )}
      {showWarnings && (
        <div style={{ display: 'grid', gap: spacing.sm }}>
          <SectionHeader title="Warnings" />
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            Warnings may affect quality.
          </div>
          <div style={{ display: 'grid', gap: spacing.sm }}>
            {warnings.map((issue) => (
              <ValidationIssueRow key={issue.id || issue.message} issue={issue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
