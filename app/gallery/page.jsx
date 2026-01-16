'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { loadGallery } from '@/gallery/galleryStore';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import {
  collectTags,
  filterByMode,
  filterBySearch,
  filterByTags,
} from '@/gallery/tagUtils';
import { GalleryFilters } from '@/gallery/GalleryFilters';

function GalleryCard({ item, ownerId }) {
  const isOwner = ownerId && item.ownerId && ownerId === item.ownerId;
  const stats = useQuery(
    api.analytics.getGalleryStats,
    isOwner ? { galleryItemId: item.id } : 'skip'
  );

  return (
    <Link
      href={item.payload ? `/viewer#${item.payload}` : `/viewer/${item.id}`}
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
        {!item.thumbnail && item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl}
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
        <div style={{ fontSize: 12, opacity: 0.7 }}>{item.description}</div>
      )}
      {(item.creatorId || item.creator?.id || item.ownerId) && (
        <div style={{ marginTop: 6 }}>
          <Link
            href={`/profile/${item.creatorId || item.creator?.id || item.ownerId}`}
            style={{ fontSize: 12, opacity: 0.7 }}
          >
            View creator
          </Link>
        </div>
      )}
      {isOwner && stats && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 12,
            color: '#6b7280',
            marginTop: 6,
          }}
        >
          <span>👁 {stats.views}</span>
          <span>⤴ {stats.forks}</span>
          <span>⬆ {stats.publishes}</span>
        </div>
      )}
    </Link>
  );
}

export default function GalleryPage() {
  const serverItems = useQuery(api.gallery.listGalleryItems);
  const items = useMemo(() => serverItems ?? loadGallery(), [serverItems]);
  const identity = useGalleryIdentity();
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
          <GalleryCard key={item.id} item={item} ownerId={identity?.id} />
        ))}

        {!visible.length && (
          <div style={{ opacity: 0.6 }}>No public items yet.</div>
        )}
      </div>
    </div>
  );
}
