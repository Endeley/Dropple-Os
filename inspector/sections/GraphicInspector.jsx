'use client';

import { InspectorSection } from '../InspectorSection';

export function GraphicInspector({ node, emit }) {
  const style = node.style || {};
  const fill = style.fill || '#000000';
  const opacity = style.opacity ?? 1;

  return (
    <InspectorSection title="Appearance">
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <span style={{ width: 48 }}>Fill</span>
        <input
          type="color"
          value={fill}
          onChange={(e) =>
            emit?.({
              type: 'node.style.update',
              payload: {
                nodeId: node.id,
                style: { ...style, fill: e.target.value },
              },
            })
          }
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <span style={{ width: 48 }}>Opacity</span>
        <input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) =>
            emit?.({
              type: 'node.style.update',
              payload: {
                nodeId: node.id,
                style: { ...style, opacity: Number(e.target.value) },
              },
            })
          }
          style={{ width: 70 }}
        />
      </label>
    </InspectorSection>
  );
}
