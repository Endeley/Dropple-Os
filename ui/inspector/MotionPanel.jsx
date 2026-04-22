'use client';

export function MotionPanel({ node }) {
  if (!node) return null;

  const motion = node.motion || node.props?.motion || null;

  if (!motion) {
    return (
      <div className="inspector-subtle" style={{ fontSize: 12 }}>
        No motion attached.
      </div>
    );
  }

  const rows = [
    { label: 'Type', value: motion.type },
    { label: 'Duration', value: motion.duration },
    { label: 'Easing', value: motion.easing },
    { label: 'Loop', value: motion.loop },
    { label: 'Autoplay', value: motion.autoplay },
  ];

  return (
    <div className="inspector-group">
      {rows.map((row) => (
        <div key={row.label} className="inspector-row" style={{ fontSize: 12 }}>
          <span className="inspector-subtle">{row.label}</span>
          <span>{row.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
