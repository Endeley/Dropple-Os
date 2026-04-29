'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplateCard from '@/marketplace/TemplateCard';

export default function CreatorPage({ params }) {
  const router = useRouter();
  const name = decodeURIComponent(params.name || '');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/marketplace?creator=${encodeURIComponent(name)}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load creator templates.');
        }

        if (!cancelled) {
          setTemplates(Array.isArray(payload?.templates) ? payload.templates : []);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [name]);

  function openTemplate(template) {
    router.push(`/marketplace/template/${template.id}`);
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2>{name}</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
        }}
      >
        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Loading templates...
          </div>
        ) : error ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Failed to load templates.
          </div>
        ) : templates.length ? (
          templates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onOpen={openTemplate} />
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No templates from this creator yet.
          </div>
        )}
      </div>
    </div>
  );
}
