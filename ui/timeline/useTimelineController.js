'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  createTimelineController,
  dispatchTrack,
  undoTimeline,
  redoTimeline,
  checkoutSnapshot,
  setSnapshotLabel,
} from '@/runtime/timeline/trackControllerBridge.js';
import { projectTimeline } from '@/runtime/projection/timelineProjection.js';

export function useTimelineController(initialTimeline) {
  const [controller, setController] = useState(() =>
    createTimelineController(initialTimeline)
  );

  // 🔒 Projection is always derived from canonical present
  const projection = useMemo(() => {
    const current =
      controller.snapshotGraph.nodes[controller.headId]?.timeline ?? initialTimeline;
    return projectTimeline(current);
  }, [controller]);

  // 🔒 UI intent → controller → dispatcher → history → hash gate
  const dispatch = useCallback((action) => {
    setController((prev) => dispatchTrack(prev, action));
  }, []);

  const undo = useCallback(() => {
    setController((prev) => undoTimeline(prev));
  }, []);

  const redo = useCallback(() => {
    setController((prev) => redoTimeline(prev));
  }, []);

  const checkout = useCallback((snapshotId) => {
    setController((prev) => checkoutSnapshot(prev, snapshotId));
  }, []);

  const setLabel = useCallback((snapshotId, label) => {
    setController((prev) => setSnapshotLabel(prev, { snapshotId, label }));
  }, []);

  const currentNode = controller.snapshotGraph.nodes[controller.headId];
  const canUndo = Boolean(currentNode?.parentIds?.length);
  const canRedo = Boolean(currentNode?.childrenIds?.length === 1);

  const snapshots = Object.values(controller.snapshotGraph.nodes)
    .map((node) => {
      const meta = controller.snapshotGraph.meta?.[node.id] ?? {};
      return {
        id: node.id,
        shortId: node.id.slice(0, 8),
        isHead: node.id === controller.headId,
        parentCount: node.parentIds?.length ?? 0,
        childCount: node.childrenIds?.length ?? 0,
        label: meta.label ?? '',
      };
    })
    .sort((a, b) => {
      const metaA = controller.snapshotGraph.meta?.[a.id];
      const metaB = controller.snapshotGraph.meta?.[b.id];
      const timeA = metaA?.createdAt ?? 0;
      const timeB = metaB?.createdAt ?? 0;
      return timeA - timeB;
    });
  const currentSnapshotId = controller.headId;

  return {
    projection,
    dispatch,
    undo,
    redo,
    checkout,
    setSnapshotLabel: setLabel,
    canUndo,
    canRedo,
    snapshots,
    currentSnapshotId,
  };
}
