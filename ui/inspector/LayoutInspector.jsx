'use client';

import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { Control, Input } from '@/ui/Control';

function AspectRatioControl({ node, emit, readOnly = false }) {
  if (!node) return null;
  const layout = node.layout || {};
  const locked = !!layout.constraints?.aspectRatio;

  function toggleLock() {
    if (readOnly) return;
    if (!locked) {
      emit({
        type: NodeMutationTypes.LAYOUT_SET_CONSTRAINT,
        payload: {
          nodeId: node.id,
          constraint: {
            aspectRatio: layout.width / layout.height,
          },
        },
      });
    } else {
      emit({
        type: NodeMutationTypes.LAYOUT_CLEAR_CONSTRAINT,
        payload: {
          nodeId: node.id,
          key: 'aspectRatio',
        },
      });
    }
  }

  return (
    <div className="inspector-row" style={{ justifyContent: 'flex-start', fontSize: 13 }}>
      <input
        type="checkbox"
        checked={locked}
        onChange={toggleLock}
        disabled={readOnly}
      />
      <span>Lock aspect ratio</span>
    </div>
  );
}

export default function LayoutInspector({ node, emit, readOnly = false }) {
  if (!node) return null;
  const layout = node.layout || {};
  function updateLayout(patch) {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.LAYOUT_UPDATE,
      payload: {
        nodeId: node.id,
        layout: patch,
      },
    });
  }

  function safeNumber(value) {
    return Number.isFinite(value) ? value : '';
  }

  return (
    <div className="inspector-group">
      <div className="inspector-title">Position</div>
      <div className="inspector-row">
        <Control label="X">
          <Input
            type="number"
            value={safeNumber(layout.x)}
            onChange={(e) => updateLayout({ x: Number(e.target.value) })}
            disabled={readOnly}
          />
        </Control>
        <Control label="Y">
          <Input
            type="number"
            value={safeNumber(layout.y)}
            onChange={(e) => updateLayout({ y: Number(e.target.value) })}
            disabled={readOnly}
          />
        </Control>
      </div>

      <div className="inspector-title">Size</div>
      <div className="inspector-row">
        <Control label="W">
          <Input
            type="number"
            min={1}
            value={safeNumber(layout.width)}
            onChange={(e) => updateLayout({ width: Number(e.target.value) })}
            disabled={readOnly}
          />
        </Control>
        <Control label="H">
          <Input
            type="number"
            min={1}
            value={safeNumber(layout.height)}
            onChange={(e) => updateLayout({ height: Number(e.target.value) })}
            disabled={readOnly}
          />
        </Control>
      </div>

      <Control label="Aspect Ratio">
        <AspectRatioControl node={node} emit={emit} readOnly={readOnly} />
      </Control>
    </div>
  );
}
