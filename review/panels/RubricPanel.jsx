'use client';

import { useEffect, useMemo, useState } from 'react';

export default function RubricPanel({ rubric, initialScores, onUpdate }) {
  const criteria = useMemo(() => rubric?.criteria ?? [], [rubric]);
  const [scores, setScores] = useState(() => initialScores ?? {});

  useEffect(() => {
    if (!initialScores) return;
    setScores(initialScores);
  }, [initialScores]);

  function toggle(id, value) {
    setScores((prev) => {
      const next = { ...prev, [id]: value };
      onUpdate?.(next);
      return next;
    });
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
