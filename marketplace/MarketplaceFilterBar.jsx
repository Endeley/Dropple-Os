'use client';

export default function MarketplaceFilterBar({
  query,
  setQuery,
  category,
  setCategory,
  level,
  setLevel,
  tag,
  setTag,
  artifactKind,
  setArtifactKind,
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
        placeholder="Search blueprints"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ ...inputStyle, flex: '1 1 220px' }}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All blueprint categories</option>
        <option value="business">Business</option>
        <option value="creative">Creative</option>
        <option value="technology">Technology</option>
        <option value="engineering">Engineering</option>
        <option value="education">Education</option>
        <option value="operations">Operations</option>
      </select>

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

      <select
        value={artifactKind}
        onChange={(e) => setArtifactKind(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All artifact types</option>
        <option value="environment">Reproducible</option>
        <option value="snapshot">Final</option>
      </select>
    </div>
  );
}
