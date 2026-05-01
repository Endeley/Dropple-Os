'use client';

import { Badge } from '@/ui/controls/ui/badge.jsx';
import { getArtifactPresentation } from '@/marketplace/artifactPresentation.js';

export default function TemplateCard({ template, onOpen }) {
  const { metadata } = template;
  const creator = metadata.creator || {};
  const pricing = metadata.pricing || { free: true };
  const priceLabel = pricing.free ? 'Free' : `$${pricing.personal}`;
  const presentation = getArtifactPresentation(template.artifact);

  return (
    <div
      onClick={() => onOpen(template)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        cursor: 'pointer',
        background: 'var(--surface-panel)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
        transition: 'border-color 120ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <Badge
          data-artifact-kind={template?.artifact?.kind ?? 'unknown'}
          style={presentation.badgeStyle}
        >
          {presentation.label}
        </Badge>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{priceLabel}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{metadata.title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {metadata.description}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {presentation.description}
      </div>
      <div style={{ marginTop: 'var(--space-xs)', fontSize: 11, color: 'var(--text-muted)' }}>
        By {creator.name || 'Unknown'}
        {creator.region ? ` · ${creator.region}` : ''}
      </div>
    </div>
  );
}
