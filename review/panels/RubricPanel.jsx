'use client';

import { useMemo } from 'react';

export default function RubricPanel({ rubric, initialScores, onUpdate }) {
  const criteria = useMemo(() => rubric?.criteria ?? [], [rubric]);
  const scores = useMemo(() => initialScores ?? {}, [initialScores]);

  function toggle(id, value) {
    const next = { ...scores, [id]: value };
    onUpdate?.(next);
  }

  if (!criteria.length) {
    return (
      <div style={{ padding: 12, fontSize: 12 }}>
        No rubric criteria available.
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Rubric</h3>

      {criteria.map((c) => (
        <div key={c.id} style={{ marginBottom: 12 }}>
          <strong>{c.label}</strong>
          <p style={{ fontSize: 12 }}>{c.description}</p>

          <label>
            <input
              type="checkbox"
              checked={scores[c.id] === true}
              onChange={() => toggle(c.id, true)}
            />
            Met
          </label>

          <label style={{ marginLeft: 8 }}>
            <input
              type="checkbox"
              checked={scores[c.id] === false}
              onChange={() => toggle(c.id, false)}
            />
            Not met
          </label>
        </div>
      ))}
    </div>
  );
}
