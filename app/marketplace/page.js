'use client';

import { useRouter } from 'next/navigation';
import { mockTemplates } from '@/marketplace/mockTemplates';
import TemplateCard from '@/marketplace/TemplateCard';
import { useMarketplaceFilters } from '@/marketplace/useMarketplaceFilters';
import MarketplaceFilterBar from '@/marketplace/MarketplaceFilterBar';
import { filterTemplates } from '@/marketplace/filterTemplates';
import { collections } from '@/marketplace/collections';

export default function MarketplacePage() {
  const router = useRouter();
  const filters = useMarketplaceFilters();
  const visibleTemplates = filterTemplates(mockTemplates, filters);

  function openTemplate(template) {
    router.push(`/marketplace/template/${template.id}`);
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2>Templates</h2>

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
              {collection.templateIds.length} templates
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
        {visibleTemplates.length ? (
          visibleTemplates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onOpen={openTemplate} />
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No templates found.
          </div>
        )}
      </div>
    </div>
  );
}
