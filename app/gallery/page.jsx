'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { loadGallery } from '@/gallery/galleryStore';
import {
  collectTags,
  filterByMode,
  filterBySearch,
  filterByTags,
} from '@/gallery/tagUtils';
import { GalleryFilters } from '@/gallery/GalleryFilters';

export default function GalleryPage() {
  const items = useMemo(() => loadGallery(), []);
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [mode, setMode] = useState(null);

  const tags = collectTags(items);
  const visible = filterBySearch(
    filterByMode(filterByTags(items, activeTags), mode),
    query
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Gallery</h1>

      <GalleryFilters
        tags={tags}
        activeTags={activeTags}
        setActiveTags={setActiveTags}
        mode={mode}
        setMode={setMode}
        query={query}
        setQuery={setQuery}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {visible.map((item) => (
          <Link
            key={item.id}
            href={`/viewer#${item.payload}`}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                height: 140,
                background: '#f1f5f9',
                borderRadius: 6,
                marginBottom: 8,
                overflow: 'hidden',
              }}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
            </div>

            <div style={{ fontWeight: 600 }}>{item.title}</div>
            {item.description && (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {item.description}
              </div>
            )}
          </Link>
        ))}

        {!visible.length && (
          <div style={{ opacity: 0.6 }}>No public items yet.</div>
        )}
      </div>
    </div>
  );
}
