export function EducationTimelinePanel({ explanations = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Explanations</div>
      {explanations.length ? (
        explanations.map((e, i) => (
          <div key={e.id || i} style={{ fontSize: 13, color: 'var(--text-primary)' }}>
            <strong style={{ marginRight: 6 }}>Step {i + 1}</strong>
            <span>{e.text}</span>
            {e.eventId ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Event: {e.eventId}
              </div>
            ) : null}
          </div>
        ))
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          No explanations yet.
        </div>
      )}
    </div>
  );
}
