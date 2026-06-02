'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplateCard from '@/marketplace/TemplateCard';
import { useMarketplaceFilters } from '@/marketplace/useMarketplaceFilters';
import MarketplaceFilterBar from '@/marketplace/MarketplaceFilterBar';
import { filterTemplates } from '@/marketplace/filterTemplates';
import { collections } from '@/marketplace/collections';

export default function MarketplacePage() {
  const router = useRouter();
  const filters = useMarketplaceFilters();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/templates/marketplace');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load templates.');
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
  }, []);

  const visibleTemplates = filterTemplates(templates, filters);

  function openTemplate(template) {
    router.push(`/marketplace/template/${template.id}`);
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2>Blueprints</h2>

      <MarketplaceFilterBar {...filters} />

      <h3 style={{ marginTop: 'var(--space-4)' }}>Featured Collections</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        {collections.map((collection) => (
          <div
            key={collection.id}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              background: 'var(--surface-1)',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{collection.title}</div>
            <div style={{ marginTop: 'var(--space-xs)', color: 'var(--text-muted)' }}>
              {collection.templateIds.length} blueprints
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
        }}
      >
        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading blueprints...</div>
        ) : error ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Failed to load blueprints.
          </div>
        ) : visibleTemplates.length ? (
          visibleTemplates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onOpen={openTemplate} />
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No blueprints found.
          </div>
        )}
      </div>
    </div>
  );
}
