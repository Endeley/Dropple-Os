'use client';

import { useSelection } from '@/components/workspace/SelectionContext';
import { useReplayState } from '@/runtime/replay/useReplayState';

export default function PropertyBar({ events, cursor }) {
  const { selectedIds } = useSelection();

  const state = useReplayState({ events, cursor });

  if (!selectedIds || selectedIds.size === 0) {
    return (
      <div className="property-bar">
        <em>No selection</em>
      </div>
    );
  }

  if (selectedIds.size > 1) {
    return (
      <div className="property-bar">
        <strong>{selectedIds.size}</strong> items selected
      </div>
    );
  }

  const selectedId = Array.from(selectedIds)[0];
  const node = state.nodes?.[selectedId];

  if (!node) {
    return (
      <div className="property-bar">
        <em>Selected node not found</em>
      </div>
    );
  }

  const layout = node.layout || {};

  return (
    <div className="property-bar">
      <strong>{node.type}</strong> · {node.id}

      <div className="property-group">
        <span>X: {layout.x ?? 0}</span>
        <span>Y: {layout.y ?? 0}</span>
        <span>W: {layout.width ?? 0}</span>
        <span>H: {layout.height ?? 0}</span>
      </div>
    </div>
  );
}
