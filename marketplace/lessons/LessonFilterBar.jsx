'use client';

import { colors, radius, spacing } from '@/ui/tokens';

export default function LessonFilterBar({
  query,
  setQuery,
  level,
  setLevel,
  duration,
  setDuration,
}) {
  const inputStyle = {
    height: 32,
    padding: `0 ${spacing.sm}px`,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: 13,
    background: '#fff',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: spacing.md,
        marginBottom: spacing.lg,
        flexWrap: 'wrap',
      }}
    >
      <input
        placeholder="Search lessons"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ ...inputStyle, flex: '1 1 220px' }}
      />

      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All durations</option>
        <option value="short">Short (&lt; 10 min)</option>
        <option value="medium">Medium (10–30 min)</option>
        <option value="long">Long (30+ min)</option>
      </select>
    </div>
  );
}
