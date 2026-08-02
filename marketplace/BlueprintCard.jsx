'use client';

import { Badge } from '@/ui/controls/ui/badge.jsx';

export default function BlueprintCard({ blueprint, onOpen }) {
  const title = blueprint?.metadata?.title ?? blueprint?.name ?? blueprint?.id ?? 'Untitled Blueprint';
  const description = blueprint?.metadata?.description ?? blueprint?.description ?? '';
  const supportedModes = Array.isArray(blueprint?.modes) ? blueprint.modes : [];

  return (
    <div
      onClick={() => onOpen(blueprint)}
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
        <Badge variant="secondary">Blueprint</Badge>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Certified</div>
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Structural foundation
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {blueprint?.blueprintCategoryLabel ?? 'Business'} Blueprint
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {supportedModes.length} supported language{supportedModes.length === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        This blueprint defines what kind of project the workspace should become before expression is selected.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
        {supportedModes.map((modeId) => (
          <Badge key={modeId} variant="secondary">
            {String(modeId).toUpperCase()}
          </Badge>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        Version: {blueprint?.lineage?.versionId ?? blueprint?.id}
      </div>
      <div style={{ marginTop: 'auto', fontSize: 12, fontWeight: 600 }}>
        Choose blueprint →
      </div>
    </div>
  );
}
