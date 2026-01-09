'use client';

import { useRouter } from 'next/navigation';
import { mockTemplates } from '@/marketplace/mockTemplates';
import { colors, spacing, radius } from '@/ui/tokens';

export default function TemplateDetailPage({ params }) {
  const router = useRouter();
  const template = mockTemplates.find((t) => t.id === params.id);

  if (!template) return <div>Not found</div>;

  const creator = template.metadata.creator || {};

  function useTemplate() {
    router.push(`/workspace/new?fromTemplate=${template.id}`);
  }

  return (
    <div style={{ padding: spacing.xl }}>
      <h2>{template.metadata.title}</h2>
      <p style={{ color: colors.textMuted }}>{template.metadata.description}</p>

      <div style={{ marginTop: spacing.sm, fontSize: 12, color: colors.textMuted }}>
        By {creator.name || 'Unknown'}
        {creator.region ? ` · ${creator.region}` : ''}
      </div>

      <button
        style={{
          marginTop: spacing.lg,
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
        onClick={useTemplate}
      >
        Use Template
      </button>
    </div>
  );
}
