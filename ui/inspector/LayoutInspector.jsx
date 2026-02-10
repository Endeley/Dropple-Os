'use client';

import { Control, Input } from '@/ui/Control';
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
  const layout = node.layout || {};
  const style = node.style || {};

  function updateLayout(patch) {
    emit({
      type: 'node.layout.update',
      payload: {
        nodeId: node.id,
        layout: patch,
      },
    });
  }

  function updateStyle(patch) {
    emit({
      type: 'node.style.update',
      payload: {
        nodeId: node.id,
        style: patch,
      },
    });
  }

  function safeNumber(value) {
    return Number.isFinite(value) ? value : '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      <div style={{ fontSize: 12, color: colors.textMuted }}>Position</div>
      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Control label="X">
          <Input
            type="number"
            value={safeNumber(layout.x)}
            onChange={(e) => updateLayout({ x: Number(e.target.value) })}
          />
        </Control>
        <Control label="Y">
          <Input
            type="number"
            value={safeNumber(layout.y)}
            onChange={(e) => updateLayout({ y: Number(e.target.value) })}
          />
        </Control>
      </div>

      <div style={{ fontSize: 12, color: colors.textMuted }}>Size</div>
      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Control label="W">
          <Input
            type="number"
            min={1}
            value={safeNumber(layout.width)}
            onChange={(e) => updateLayout({ width: Number(e.target.value) })}
          />
        </Control>
        <Control label="H">
          <Input
            type="number"
            min={1}
            value={safeNumber(layout.height)}
            onChange={(e) => updateLayout({ height: Number(e.target.value) })}
          />
        </Control>
      </div>

      <Control label="Opacity">
        <Input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={safeNumber(style.opacity ?? 1)}
          onChange={(e) => updateStyle({ opacity: Number(e.target.value) })}
        />
      </Control>

      <Control label="Aspect Ratio">
        <AspectRatioControl node={node} emit={emit} />
      </Control>
    </div>
  );
}
