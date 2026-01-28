import { colors, spacing } from '@/ui/tokens';
import { ValidationIssueRow } from './ValidationIssueRow';

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

export function SheetIssues({ blockingIssues = [], warnings = [], status }) {
  const showBlocking = status === 'block' && blockingIssues.length > 0;
  const showWarnings = warnings.length > 0;
  const showNoBlockingNotice = status === 'warn' && blockingIssues.length === 0;

  if (!showBlocking && !showWarnings) {
    return (
      <div
        style={{
          display: 'grid',
          gap: spacing.sm,
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <SectionHeader title="Blocking issues" />
        <div style={{ fontSize: 12, color: colors.textMuted }}>
          No blocking issues or warnings.
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
      {showBlocking && (
        <div style={{ display: 'grid', gap: spacing.sm }}>
          <SectionHeader title="Blocking issues" />
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            These issues must be resolved before export.
          </div>
          <div style={{ display: 'grid', gap: spacing.sm }}>
            {blockingIssues.map((issue) => (
              <ValidationIssueRow key={issue.id || issue.message} issue={issue} />
            ))}
          </div>
        </div>
      )}
      {showNoBlockingNotice && (
        <div style={{ fontSize: 12, color: colors.textMuted }}>
          No blocking issues detected.
        </div>
      )}
      {showWarnings && (
        <div style={{ display: 'grid', gap: spacing.sm }}>
          <SectionHeader title="Warnings" />
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            Warnings won't prevent export, but may affect quality.
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
