'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/ui/controls/ui/badge.jsx';
import {
  createMarketplaceResolutionSearchParams,
  resolveMarketplaceResolutionState,
} from '@/marketplace/marketplaceResolution.js';

function toTitleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function BlueprintDetailPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolutionState = resolveMarketplaceResolutionState(searchParams);
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBlueprint() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/blueprints/marketplace?id=${encodeURIComponent(params.id)}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load blueprint.');
        }

        if (!cancelled) {
          setBlueprint(payload?.blueprint ?? null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError);
          setBlueprint(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBlueprint();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>Loading blueprint...</div>;
  if (error) return <div style={{ padding: 'var(--space-6)' }}>Failed to load blueprint.</div>;
  if (!blueprint) return <div style={{ padding: 'var(--space-6)' }}>Not found</div>;

  const isCommittedBlueprint =
    resolutionState.committed && resolutionState.artifactId === blueprint.id;
  const supportedModes = Array.isArray(blueprint?.modes) ? blueprint.modes : [];
  const inspectionState = isCommittedBlueprint
    ? {
        label: 'Committed',
        body: 'This blueprint has been chosen as the structural foundation for the session.',
      }
    : {
        label: 'Inspecting',
        body: 'You are inspecting a possible structural starting point. Opening this page does not launch the workspace.',
      };

  function buildMarketplaceHref({ committed = false, artifactId = null } = {}) {
    const resolutionParams = createMarketplaceResolutionSearchParams({
      entryIntent: 'blueprint',
      query: resolutionState.query,
      mode: resolutionState.mode,
      category: resolutionState.category,
      artifactId,
      committed,
      expressionStrategy: resolutionState.expressionStrategy,
      expressionTemplateId: resolutionState.expressionTemplateId,
      expressionCommitted: resolutionState.expressionCommitted,
    });
    const query = resolutionParams.toString();
    return query.length > 0 ? `/marketplace?${query}` : '/marketplace';
  }

  function commitBlueprintChoice() {
    router.push(
      buildMarketplaceHref({
        artifactId: blueprint.id,
        committed: true,
      }),
    );
  }

  function returnToMarketplace() {
    router.push(
      buildMarketplaceHref({
        artifactId: resolutionState.artifactId,
        committed: resolutionState.committed,
      }),
    );
  }

  function continueToExpressionResolution() {
    router.push(
      buildMarketplaceHref({
        artifactId: blueprint.id,
        committed: true,
      }),
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
        <Badge variant="secondary">Blueprint</Badge>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Structural foundation selected here. Expression is resolved next.
        </div>
      </div>
      <h2>{blueprint?.metadata?.title ?? blueprint?.name ?? blueprint?.id}</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        {blueprint?.metadata?.description ?? blueprint?.description ?? ''}
      </p>

      <div
        style={{
          marginTop: 'var(--space-md)',
          padding: 'var(--space-3)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-1)',
          display: 'grid',
          gap: 'var(--space-xs)',
          maxWidth: 720,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Blueprint state
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{inspectionState.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{inspectionState.body}</div>
        {isCommittedBlueprint ? (
          <div style={{ fontSize: 13, color: 'var(--color-primary)' }}>
            Structure is resolved. Return to Marketplace to choose the starting expression.
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gap: 'var(--space-sm)', maxWidth: 760 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Blueprint category</div>
          <div style={{ marginTop: 'var(--space-xs)', fontSize: 13, fontWeight: 600 }}>
            {blueprint?.blueprintCategoryLabel ?? 'Business'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supported creative families</div>
          <div style={{ marginTop: 'var(--space-xs)', fontSize: 13, fontWeight: 600 }}>
            {supportedModes.length > 0 ? supportedModes.map(toTitleCase).join(', ') : 'Unavailable'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Blueprint version</div>
          <div style={{ marginTop: 'var(--space-xs)', fontSize: 13, fontWeight: 600 }}>
            {blueprint?.lineage?.versionId ?? blueprint?.id}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Certification</div>
          <div style={{ marginTop: 'var(--space-xs)', fontSize: 13, fontWeight: 600 }}>
            {blueprint?.certification?.hash ? 'Dropple Certified' : 'Unavailable'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
        <button
          style={{
            minWidth: 32,
            height: 32,
            padding: '0 var(--space-sm)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          onClick={returnToMarketplace}
        >
          Back to Marketplace
        </button>
        <button
          style={{
            minWidth: 32,
            height: 32,
            padding: '0 var(--space-sm)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            background: isCommittedBlueprint ? 'rgba(123, 92, 255, 0.14)' : 'var(--surface-1)',
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          onClick={commitBlueprintChoice}
        >
          {isCommittedBlueprint ? 'Blueprint committed' : 'Choose this blueprint'}
        </button>
        {isCommittedBlueprint ? (
          <button
            style={{
              minWidth: 32,
              height: 32,
              padding: '0 var(--space-sm)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(123, 92, 255, 0.14)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
            onClick={continueToExpressionResolution}
          >
            Continue to expression
          </button>
        ) : null}
      </div>
    </div>
  );
}
