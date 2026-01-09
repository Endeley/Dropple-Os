'use client';

import { createTemplateArtifact } from './templateTypes';
import { serializeWorkspaceForTemplate } from './TemplateSerializer';
import { validateTemplate } from './TemplateValidator';
import { colors, spacing, radius } from '@/ui/tokens';

export default function TemplateGeneratorOverlay({
  open,
  onClose,
  state,
  events,
  mode,
}) {
  if (!open) return null;

  function publish() {
    const { snapshot, events: sliced } = serializeWorkspaceForTemplate({
      state,
      events,
      startCursor: -1,
    });

    const errors = validateTemplate({ snapshot, events: sliced });
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    const artifact = createTemplateArtifact({
      id: crypto.randomUUID(),
      mode: mode.id,
      snapshot,
      events: sliced,
      metadata: {
        title: 'Untitled Template',
        description: '',
      },
    });

    console.log('TEMPLATE ARTIFACT', artifact);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: colors.panelBg,
          padding: spacing.lg,
          width: 420,
          borderRadius: radius.md,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Create Template</h3>
        <p style={{ color: colors.textMuted }}>
          This will package your current design as a reusable template.
        </p>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            onClick={publish}
            style={{
              minWidth: 32,
              height: 32,
              padding: `0 ${spacing.sm}px`,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.sm,
              background: '#fff',
              fontSize: 12,
            }}
          >
            Publish Template
          </button>
          <button
            onClick={onClose}
            style={{
              minWidth: 32,
              height: 32,
              padding: `0 ${spacing.sm}px`,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.sm,
              background: '#fff',
              fontSize: 12,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
