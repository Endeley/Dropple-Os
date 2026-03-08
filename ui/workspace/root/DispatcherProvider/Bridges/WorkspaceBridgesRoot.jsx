'use client';

import { useEffect } from 'react';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { registerWorkspaceBridge } from '@/ui/bridges/workspaceBridge.js';
import { registerViewportBridge } from '@/ui/bridges/viewportBridge.js';
import { registerCanvasSurfaceBridge } from '@/ui/bridges/canvasSurfaceBridge.js';
import { registerNodeCreateBridge } from '@/ui/bridges/nodeCreateBridge.js';
import { registerNodeUpdateBridge } from '@/ui/bridges/nodeUpdateBridge.js';
import { registerNodeDragBridge } from '@/ui/bridges/nodeDragBridge.js';
import { registerAlignmentBridge } from '@/ui/bridges/alignmentBridge.js';
import { registerGroupSessionBridge } from '@/ui/bridges/groupSessionBridge.js';
import { registerSessionBridge } from '@/ui/bridges/sessionBridge.js';
import { registerSessionCommitBridge } from '@/ui/bridges/sessionCommitBridge.js';
import { registerHistoryBridge } from '@/ui/bridges/historyBridge.js';
import { registerEditEventBridge } from '@/ui/bridges/editEventBridge.js';
import { registerAnimationKeyframeBridge } from '@/ui/bridges/animationKeyframeBridge.js';
import { registerLayoutConvertBridge } from '@/ui/bridges/layoutConvertBridge.js';
import { registerTimelineBridge } from '@/ui/bridges/timelineBridge.js';

export function WorkspaceBridgesRoot() {
  const dispatcher = useDispatcher();

  useEffect(() => {
    if (!dispatcher?.dispatch) return;

    const dispatch = dispatcher.dispatch;
    const disposers = [
      registerWorkspaceBridge(dispatcher),
      registerViewportBridge(dispatcher),
      registerCanvasSurfaceBridge(dispatch),
      registerNodeCreateBridge(dispatch),
      registerNodeUpdateBridge(dispatcher),
      registerNodeDragBridge(dispatch),
      registerAlignmentBridge(dispatcher),
      registerGroupSessionBridge(),
      registerSessionBridge(),
      registerSessionCommitBridge(dispatch),
      registerHistoryBridge(dispatcher),
      registerEditEventBridge(dispatch),
      registerAnimationKeyframeBridge(dispatch),
      registerLayoutConvertBridge(dispatcher),
      registerTimelineBridge(dispatcher),
    ];

    return () => {
      disposers.forEach((dispose) => dispose?.());
    };
  }, [dispatcher]);

  return null;
}
