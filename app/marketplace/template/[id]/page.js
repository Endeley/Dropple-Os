'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnership } from '@/marketplace/useOwnershipStore';
import { Badge } from '@/ui/controls/ui/badge.jsx';
import { getArtifactPresentation } from '@/marketplace/artifactPresentation.js';
import { resolveCanonicalWorkspaceOverlayContext } from '@/platform/workspaces/index.js';
import { getExportCapabilities } from '@/runtime/export/getExportCapabilities.js';

export default function TemplateDetailPage({ params }) {
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ownership = useOwnership();
  const user = { id: 'user-local' };
  const [license, setLicense] = useState('personal');

  useEffect(() => {
    let cancelled = false;

    async function loadTemplate() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/marketplace?id=${encodeURIComponent(params.id)}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load template.');
        }

        if (!cancelled) {
          setTemplate(payload?.template ?? null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError);
          setTemplate(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTemplate();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>Loading template...</div>;
  if (error) return <div style={{ padding: 'var(--space-6)' }}>Failed to load template.</div>;
  if (!template) return <div style={{ padding: 'var(--space-6)' }}>Not found</div>;

  const creator = template.metadata.creator || {};
  const pricing = template.metadata.pricing || { free: true };
  const presentation = getArtifactPresentation(template.artifact);
  const exportCapabilities = getExportCapabilities(template.artifact);
  const owned = pricing.free
    ? true
    : ownership?.hasOwnership(user.id, template.id);
  const canUseTemplate = owned && presentation.capabilities.canInstall;
  const lineageRootId =
    template?.lineageRootId ??
    template?.certification?.lineageRootId ??
    null;
  const versionId =
    template?.versionId ??
    template?.certification?.lineageNodeId ??
    null;

  function useTemplate() {
    if (!canUseTemplate) return;
    const overlayContext = resolveCanonicalWorkspaceOverlayContext({
      workspaceId: template?.workspaceId ?? null,
      modeId: template?.modeId ?? template?.mode ?? null,
    });

    if (!lineageRootId || !versionId) {
      throw new Error('Template is missing lineage identity.');
    }

    const params = new URLSearchParams({
      lineageRootId,
      versionId,
      workspaceId: overlayContext.workspaceId,
      modeId: overlayContext.canonicalModeId ?? overlayContext.modeId,
    });

    if (overlayContext.overlayId) {
      params.set('overlayId', overlayContext.overlayId);
    }

    router.push(`/workspace/new?${params.toString()}`);
  }

  function buySelectedLicense() {
    if (pricing.free || !ownership) return;
    ownership.grantOwnership({
      userId: user.id,
      artifactId: template.id,
      type: 'template',
      license,
      purchasedAt: Date.now(),
    });
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
        <Badge
          data-capability={exportCapabilities.label}
          style={presentation.badgeStyle}
        >
          {exportCapabilities.label}
        </Badge>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {exportCapabilities.description}
        </div>
      </div>
      <h2>{template.metadata.title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>{template.metadata.description}</p>

      <div style={{ marginTop: 'var(--space-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
        By {creator.name || 'Unknown'}
        {creator.region ? ` · ${creator.region}` : ''}
      </div>

      {presentation.capabilities.canInspectLineage ? (
        <div style={{ marginTop: 'var(--space-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
          Lineage root: {lineageRootId || 'Unavailable'}
          <br />
          Version: {versionId || 'Unavailable'}
        </div>
      ) : null}

      <div style={{ marginTop: 'var(--space-lg)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Artifact capability</div>
        <div style={{ marginTop: 'var(--space-xs)', fontSize: 13, fontWeight: 600 }}>
          {exportCapabilities.label}
        </div>
        <div style={{ marginTop: 'var(--space-xs)', fontSize: 12, color: 'var(--text-muted)' }}>
          {exportCapabilities.description}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
          {exportCapabilities.formats.map((format) => (
            <Badge key={format} variant='secondary'>
              {format.toUpperCase()}
            </Badge>
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
          {exportCapabilities.reproducible ? 'Deterministic output' : 'Non-deterministic output'}
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-lg)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Licenses</div>
        {pricing.free ? (
          <div style={{ marginTop: 'var(--space-xs)', fontSize: 13 }}>Free</div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <label style={{ fontSize: 13 }}>
              <input
                type="radio"
                name="license"
                value="personal"
                checked={license === 'personal'}
                onChange={(e) => setLicense(e.target.value)}
              />
              <span style={{ marginLeft: 'var(--space-xs)' }}>
                Personal · ${pricing.personal}
              </span>
            </label>
            <label style={{ fontSize: 13 }}>
              <input
                type="radio"
                name="license"
                value="commercial"
                checked={license === 'commercial'}
                onChange={(e) => setLicense(e.target.value)}
              />
              <span style={{ marginLeft: 'var(--space-xs)' }}>
                Commercial · ${pricing.commercial}
              </span>
            </label>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-lg)', fontSize: 12, color: 'var(--text-muted)' }}>
        {presentation.capabilities.canRemix
          ? '✔ Fork & edit · ✔ Use in projects · ✖ Resell template'
          : '✔ Preview final output · ✖ Remix or install into workspace'}
      </div>

      {!pricing.free && !owned ? (
        <button
          style={{
            marginTop: 'var(--space-lg)',
            minWidth: 32,
            height: 32,
            padding: '0 var(--space-sm)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          onClick={buySelectedLicense}
        >
          Buy {license === 'commercial' ? 'Commercial' : 'Personal'} License
        </button>
      ) : null}

      {presentation.capabilities.canInstall ? (
        <button
          style={{
            marginTop: 'var(--space-lg)',
            minWidth: 32,
            height: 32,
            padding: '0 var(--space-sm)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          onClick={useTemplate}
          disabled={!owned}
        >
          Use Template
        </button>
      ) : (
        <div style={{ marginTop: 'var(--space-lg)', fontSize: 12, color: 'var(--text-muted)' }}>
          Final artifacts can be viewed, but not installed into a workspace.
        </div>
      )}
    </div>
  );
}
