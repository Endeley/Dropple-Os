import { colors, spacing, radius } from '@/ui/tokens';

export function Sheet({
  open = false,
  side = 'right',
  width = 400,
  children,
  ariaLabel = 'Export review',
}) {
  if (!open) return null;

  const isRight = side === 'right';

  return (
    <div
      aria-label={ariaLabel}
      role="region"
      style={{
        position: 'fixed',
        top: 64,
        right: isRight ? spacing.lg : 'auto',
        left: isRight ? 'auto' : spacing.lg,
        width,
        maxWidth: 'min(420px, 92vw)',
        maxHeight: 'calc(100vh - 80px)',
        background: colors.panelBg,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        zIndex: 40,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: spacing.lg,
          padding: spacing.lg,
          overflow: 'auto',
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
