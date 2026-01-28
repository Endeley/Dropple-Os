import { colors, spacing } from '@/ui/tokens';
import { Button } from '@/ui/controls/ui/button.jsx';

export function SheetFooter({ status, onCancel, onProceed }) {
  const isBlocked = status === 'block';

  return (
    <div style={{ display: 'grid', gap: spacing.md }}>
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        {isBlocked
          ? 'Fix blocking issues to export.'
          : "Warnings won't prevent export, but may affect quality."}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {isBlocked ? (
          <Button variant="primary" onClick={onCancel} aria-label="Cancel export">
            Cancel export
          </Button>
        ) : (
          <>
            <Button onClick={onCancel} aria-label="Cancel export">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onProceed}
              aria-label="Proceed with export despite warnings"
            >
              Export anyway
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
