'use client';

export function GalleryFilters({
  tags,
  activeTags,
  setActiveTags,
  mode,
  setMode,
  query,
  setQuery,
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginBottom: 16,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <input
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 6, minWidth: 200 }}
      />

      <select
        value={mode || ''}
        onChange={(e) => setMode(e.target.value || null)}
      >
        <option value="">All modes</option>
        <option value="graphic">Graphic</option>
        <option value="ui">UI</option>
        <option value="animation">Animation</option>
      </select>

      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() =>
            setActiveTags((current) =>
              current.includes(tag)
                ? current.filter((value) => value !== tag)
                : [...current, tag]
            )
          }
          style={{
            padding: '4px 8px',
            borderRadius: 999,
            border: '1px solid #e5e7eb',
            background: activeTags.includes(tag) ? '#e0f2fe' : '#fff',
            fontSize: 12,
          }}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
