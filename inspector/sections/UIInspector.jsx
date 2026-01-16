'use client';

import { InspectorSection } from '../InspectorSection';
import { NumericInput } from '@/ui/inputs/NumericInput';

export function UIInspector({ node, emit }) {
  const layout = node.layout || {};
  const autoLayout = layout.autoLayout || {};
  const direction = autoLayout.direction || 'row';
  const gap = autoLayout.gap ?? 0;

  function emitAutoLayout(nextConfig) {
    emit?.({
      type: 'node.layout.setAutoLayout',
      payload: {
        nodeId: node.id,
        config: {
          type: 'flex',
          direction,
          gap,
          ...autoLayout,
          ...nextConfig,
        },
      },
    });
  }

  return (
    <InspectorSection title="Auto Layout">
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <span style={{ width: 68 }}>Direction</span>
        <select
          value={direction}
          onChange={(e) => emitAutoLayout({ direction: e.target.value })}
        >
          <option value="row">Horizontal</option>
          <option value="column">Vertical</option>
        </select>
      </label>
      <NumericInput
        label="Gap"
        value={gap}
        onChange={(value) => emitAutoLayout({ gap: value })}
      />
    </InspectorSection>
  );
}
