'use client';

import { useRouter } from 'next/navigation';
import { mockTemplates } from '@/marketplace/mockTemplates';
import TemplateCard from '@/marketplace/TemplateCard';
import { spacing } from '@/ui/tokens';

export default function MarketplacePage() {
  const router = useRouter();

  function openTemplate(template) {
    router.push(`/marketplace/template/${template.id}`);
  }

  return (
    <div style={{ padding: spacing.xl }}>
      <h2>Templates</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: spacing.lg,
          marginTop: spacing.lg,
        }}
      >
        {mockTemplates.map((tpl) => (
          <TemplateCard key={tpl.id} template={tpl} onOpen={openTemplate} />
        ))}
      </div>
    </div>
  );
}
