'use client';

import { InspectorSection } from '../InspectorSection';
import { NumericInput } from '@/ui/inputs/NumericInput';
import { AspectLockToggle } from '@/ui/controls/AspectLockToggle';

export function CommonInspector({ node, layout, emit, lockAspect, setLockAspect }) {
  const ratio = layout.width && layout.height ? layout.width / layout.height : 1;

  return (
    <InspectorSection title="Layout">
      <NumericInput
        label="X"
        value={layout.x}
        onChange={(x) =>
          emit?.({
            type: 'node.layout.move',
            payload: {
              nodeId: node.id,
              x,
              y: layout.y || 0,
            },
          })
        }
      />
      <NumericInput
        label="Y"
        value={layout.y}
        onChange={(y) =>
          emit?.({
            type: 'node.layout.move',
            payload: {
              nodeId: node.id,
              x: layout.x || 0,
              y,
            },
          })
        }
      />

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <NumericInput
          label="W"
          value={layout.width}
          min={1}
          onChange={(width) => {
            const nextWidth = Math.max(1, width);
            const nextHeight = lockAspect
              ? Math.max(1, nextWidth / ratio)
              : layout.height || 0;
            emit?.({
              type: 'node.layout.resize',
              payload: {
                nodeId: node.id,
                width: nextWidth,
                height: nextHeight,
              },
            });
          }}
        />
        <NumericInput
          label="H"
          value={layout.height}
          min={1}
          onChange={(height) => {
            const nextHeight = Math.max(1, height);
            const nextWidth = lockAspect
              ? Math.max(1, nextHeight * ratio)
              : layout.width || 0;
            emit?.({
              type: 'node.layout.resize',
              payload: {
                nodeId: node.id,
                width: nextWidth,
                height: nextHeight,
              },
            });
          }}
        />
        <AspectLockToggle
          locked={lockAspect}
          onToggle={() => setLockAspect((v) => !v)}
        />
      </div>
    </InspectorSection>
  );
}
