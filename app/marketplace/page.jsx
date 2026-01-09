'use client';

import { useRouter } from 'next/navigation';
import { mockTemplates } from '@/marketplace/mockTemplates';
import TemplateCard from '@/marketplace/TemplateCard';
import { spacing } from '@/ui/tokens';
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
    <div style={{ padding: spacing.xl }}>
      <h2>Templates</h2>

      <MarketplaceFilterBar {...filters} />

      <h3 style={{ marginTop: spacing.lg }}>Featured Collections</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: spacing.md,
          marginTop: spacing.sm,
        }}
      >
        {collections.map((collection) => (
          <div
            key={collection.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: spacing.md,
              background: '#fff',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{collection.title}</div>
            <div style={{ marginTop: spacing.xs, color: '#64748b' }}>
              {collection.templateIds.length} templates
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: spacing.lg,
          marginTop: spacing.lg,
        }}
      >
        {visibleTemplates.length ? (
          visibleTemplates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onOpen={openTemplate} />
          ))
        ) : (
          <div style={{ fontSize: 13, color: '#64748b' }}>
            No templates found.
          </div>
        )}
      </div>
    </div>
  );
}
