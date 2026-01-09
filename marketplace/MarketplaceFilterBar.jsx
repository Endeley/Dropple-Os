'use client';

import { colors, radius, spacing } from '@/ui/tokens';

export default function MarketplaceFilterBar({
  query,
  setQuery,
  level,
  setLevel,
  tag,
  setTag,
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
        placeholder="Search templates"
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
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All tags</option>
        <option value="ui">UI</option>
        <option value="landing">Landing</option>
      </select>
    </div>
  );
}
