'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { getCreator } from '@/profiles/creatorStore';
import { loadGallery } from '@/gallery/galleryStore';

export default function ProfilePage({ params }) {
  const creator = useMemo(() => getCreator(params.id), [params.id]);
  const items = useMemo(
    () => loadGallery().filter((item) => item.creatorId === params.id),
    [params.id]
  );

  if (!creator) {
    return <div style={{ padding: 24 }}>Profile not found.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {creator.avatar && (
            <img
              src={creator.avatar}
              alt={creator.name}
              style={{ width: 64, height: 64, borderRadius: '50%' }}
            />
          )}
          <div>
            <h1>{creator.name}</h1>
            {creator.bio && <p style={{ opacity: 0.7 }}>{creator.bio}</p>}
            {creator.links?.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={{ marginRight: 12, fontSize: 12 }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/viewer#${item.payload}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ height: 140, marginBottom: 8, overflow: 'hidden' }}>
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <strong>{item.title}</strong>
              {item.description && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {item.description}
                </div>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
