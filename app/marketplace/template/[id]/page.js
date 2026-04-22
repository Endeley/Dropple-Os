'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockTemplates } from '@/marketplace/mockTemplates';
import { useOwnership } from '@/marketplace/useOwnershipStore';

export default function TemplateDetailPage({ params }) {
  const router = useRouter();
  const template = mockTemplates.find((t) => t.id === params.id);
  const ownership = useOwnership();
  const user = { id: 'user-local' };
  const [license, setLicense] = useState('personal');

  if (!template) return <div>Not found</div>;

  const creator = template.metadata.creator || {};
  const pricing = template.metadata.pricing || { free: true };
  const owned = pricing.free
    ? true
    : ownership?.hasOwnership(user.id, template.id);

  function useTemplate() {
    if (!owned) return;
    router.push(`/workspace/new?fromTemplate=${template.id}`);
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
      <h2>{template.metadata.title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>{template.metadata.description}</p>

      <div style={{ marginTop: 'var(--space-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
        By {creator.name || 'Unknown'}
        {creator.region ? ` · ${creator.region}` : ''}
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
        ✔ Fork & edit · ✔ Use in projects · ✖ Resell template
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
    </div>
  );
}
