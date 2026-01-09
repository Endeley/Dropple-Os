'use client';

import { Control } from '@/ui/Control';
import { colors, spacing } from '@/ui/tokens';

function AspectRatioControl({ node, emit }) {
  const layout = node.layout || {};
  const locked = !!layout.constraints?.aspectRatio;

  function toggleLock() {
    if (!locked) {
      emit({
        type: 'node.layout.setConstraint',
        payload: {
          nodeId: node.id,
          constraint: {
            aspectRatio: layout.width / layout.height,
          },
        },
      });
    } else {
      emit({
        type: 'node.layout.clearConstraint',
        payload: {
          nodeId: node.id,
          key: 'aspectRatio',
        },
      });
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: spacing.sm,
        alignItems: 'center',
        fontSize: 13,
        color: colors.text,
      }}
    >
      <input type="checkbox" checked={locked} onChange={toggleLock} />
      <span>Lock aspect ratio</span>
    </div>
  );
}

export default function LayoutInspector({ node, emit }) {
  if (!node) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      <div style={{ fontSize: 12, color: colors.textMuted }}>Size</div>
      <Control label="Aspect Ratio">
        <AspectRatioControl node={node} emit={emit} />
      </Control>
    </div>
  );
}
