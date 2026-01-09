import { colors, spacing, radius } from '@/ui/tokens';

export function AnnotationOverlay({ annotations }) {
  return (
    <>
      {annotations.map((a, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: a.x,
            top: a.y,
            background: colors.panelBg,
            border: `1px solid ${colors.borderStrong}`,
            padding: spacing.sm,
            fontSize: 12,
            maxWidth: 240,
            borderRadius: radius.sm,
            pointerEvents: 'none',
          }}
        >
          {a.text}
        </div>
      ))}
    </>
  );
}
