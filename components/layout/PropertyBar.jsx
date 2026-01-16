'use client';

import { useEffect, useState } from 'react';
import { useSelection } from '@/components/workspace/SelectionContext';
import { useReplayState } from '@/runtime/replay/useReplayState';
import { useMode } from '@/components/workspace/ModeContext';
import { CommonInspector } from '@/inspector/sections/CommonInspector';
import { GraphicInspector } from '@/inspector/sections/GraphicInspector';
import { UIInspector } from '@/inspector/sections/UIInspector';
import { AnimationInspector } from '@/inspector/sections/AnimationInspector';

export default function PropertyBar({ events, cursor, emit }) {
  const { selectedIds } = useSelection();
  const state = useReplayState({ events, cursor });
  const [lockAspect, setLockAspect] = useState(false);
  const mode = useMode();

  const selectionCount = selectedIds?.size ?? 0;
  const selectedId = selectionCount === 1 ? Array.from(selectedIds)[0] : null;

  const node = selectedId ? state.nodes?.[selectedId] : null;
  const layout = node?.layout || {};

  useEffect(() => {
    setLockAspect(false);
  }, [selectedId]);

  return (
    <div className="property-bar">
      <div
        className="property-bar-content"
        style={{
          transition: 'opacity 120ms ease, transform 120ms ease',
          opacity: 1,
          transform: 'translateY(0)',
        }}
      >
        {selectionCount === 0 && (
          <>
            <strong>Properties</strong>
            <div className="property-hint">
              Select or create an object to inspect and edit.
            </div>
          </>
        )}

        {selectionCount > 1 && (
          <>
            <strong>{selectionCount} items selected</strong>
            <div className="property-hint">
              Adjust shared properties or refine your selection.
            </div>
          </>
        )}

        {selectionCount === 1 && !node && (
          <>
            <strong>Selection</strong>
            <div className="property-hint">
              Selection context changed — reselect to continue editing.
            </div>
          </>
        )}

        {selectionCount === 1 && node && (
          <>
            <strong>{node.type}</strong> · {node.id}

            <CommonInspector
              node={node}
              layout={layout}
              emit={emit}
              lockAspect={lockAspect}
              setLockAspect={setLockAspect}
            />

            {(mode === 'graphic' || mode === 'design') && (
              <GraphicInspector node={node} emit={emit} />
            )}

            {mode === 'ui' && <UIInspector node={node} emit={emit} />}

            {mode === 'animation' && <AnimationInspector node={node} />}
          </>
        )}
      </div>
    </div>
  );
}
