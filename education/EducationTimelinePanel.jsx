import { colors, spacing } from '@/ui/tokens';

export function EducationTimelinePanel({ explanations = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      <div style={{ fontSize: 12, color: colors.textMuted }}>Explanations</div>
      {explanations.length ? (
        explanations.map((e, i) => (
          <div key={e.id || i} style={{ fontSize: 13, color: colors.text }}>
            <strong style={{ marginRight: 6 }}>Step {i + 1}</strong>
            <span>{e.text}</span>
            {e.eventId ? (
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                Event: {e.eventId}
              </div>
            ) : null}
          </div>
        ))
      ) : (
        <div style={{ fontSize: 13, color: colors.textMuted }}>
          No explanations yet.
        </div>
      )}
    </div>
  );
}
