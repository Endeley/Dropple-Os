'use client';

import { useRouter } from 'next/navigation';
import { mockTemplates } from '@/marketplace/mockTemplates';
import TemplateCard from '@/marketplace/TemplateCard';

export default function CreatorPage({ params }) {
  const router = useRouter();
  const name = decodeURIComponent(params.name || '');
  const templates = mockTemplates.filter(
    (t) => t.metadata.creator?.name === name
  );

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
        {templates.length ? (
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
