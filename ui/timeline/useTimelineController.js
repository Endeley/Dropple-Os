'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  createTimelineController,
  dispatchTrack,
  undoTimeline,
  redoTimeline,
  checkoutSnapshot,
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

  const currentNode = controller.snapshotGraph.nodes[controller.headId];
  const canUndo = Boolean(currentNode?.parentIds?.length);
  const canRedo = Boolean(currentNode?.childrenIds?.length === 1);

  const snapshots = Object.values(controller.snapshotGraph.nodes);
  const currentSnapshotId = controller.headId;

  return {
    projection,
    dispatch,
    undo,
    redo,
    checkout,
    canUndo,
    canRedo,
    snapshots,
    currentSnapshotId,
  };
}
