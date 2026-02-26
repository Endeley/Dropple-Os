'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  createTimelineController,
  dispatchTrack,
  undoTimeline,
  redoTimeline,
} from '@/runtime/timeline/trackControllerBridge.js';
import { projectTimeline } from '@/runtime/projection/timelineProjection.js';

export function useTimelineController(initialTimeline) {
  const [controller, setController] = useState(() =>
    createTimelineController(initialTimeline)
  );

  // 🔒 Projection is always derived from canonical present
  const projection = useMemo(() => {
    return projectTimeline(controller.history.present);
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

  const canUndo = controller.history.past.length > 0;
  const canRedo = controller.history.future.length > 0;

  return {
    projection,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
