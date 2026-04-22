'use client';

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
    padding: '0 var(--space-sm)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    background: 'var(--surface-1)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
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
