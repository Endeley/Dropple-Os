'use client';

import { Badge } from '@/ui/controls/ui/badge.jsx';
import { getArtifactPresentation } from '@/marketplace/artifactPresentation.js';
import { getExportCapabilities } from '@/runtime/export/getExportCapabilities.js';

function getEntryPresentation(entryIntent) {
  if (entryIntent === 'template') {
    return {
      eyebrow: 'Template',
      title: 'Starting expression',
      bodyLabel: 'This template gives you a faster expressive starting point once the structural direction is already clear.',
      ctaLabel: 'Open template',
      secondaryLabel: 'Structural fit',
    };
  }

  return {
    eyebrow: 'Blueprint',
    title: 'Structural foundation',
    bodyLabel: 'This blueprint establishes the kind of thing you are building before you choose how it should begin to look or feel.',
    ctaLabel: 'Choose blueprint',
    secondaryLabel: 'Expression available',
  };
}

export default function TemplateCard({ template, entryIntent = 'blueprint', onOpen }) {
  const { metadata } = template;
  const creator = metadata.creator || {};
  const pricing = metadata.pricing || { free: true };
  const priceLabel = pricing.free ? 'Free' : `$${pricing.personal}`;
  const presentation = getArtifactPresentation(template.artifact);
  const exportCapabilities = getExportCapabilities(template.artifact);
  const entryPresentation = getEntryPresentation(entryIntent);
  const modeLabel = typeof template?.mode === 'string'
    ? template.mode.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Workspace';

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
          data-capability={exportCapabilities.label}
          style={presentation.badgeStyle}
        >
          {entryPresentation.eyebrow}
        </Badge>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{priceLabel}</div>
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {entryPresentation.title}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{metadata.title}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {modeLabel}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {template?.blueprintCategoryLabel ?? 'Business'} Blueprint
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {metadata.description}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {entryPresentation.bodyLabel}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {entryPresentation.secondaryLabel}: {exportCapabilities.label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
        {exportCapabilities.formats.map((format) => (
          <Badge key={format} variant='secondary'>
            {format.toUpperCase()}
          </Badge>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {exportCapabilities.reproducible ? 'Deterministic' : 'Non-deterministic'}
      </div>
      <div style={{ marginTop: 'auto', fontSize: 12, fontWeight: 600 }}>
        {entryPresentation.ctaLabel} →
      </div>
      <div style={{ marginTop: 'var(--space-xs)', fontSize: 11, color: 'var(--text-muted)' }}>
        By {creator.name || 'Unknown'}
        {creator.region ? ` · ${creator.region}` : ''}
      </div>
    </div>
  );
}
