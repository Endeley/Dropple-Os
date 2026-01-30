import { colors, spacing } from '@/ui/tokens';
import { Button } from '@/ui/controls/ui/button.jsx';
import { EXPORT_GATE_STATUS } from '@/export/exportGateStatus';

export function SheetFooter({ status, onCancel, onProceed }) {
  const isHalted = status === EXPORT_GATE_STATUS.HALT;

  return (
    <div style={{ display: 'grid', gap: spacing.md }}>
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        {isHalted
          ? 'Resolve critical issues to export.'
          : 'Warnings may affect quality.'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {isHalted ? (
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
