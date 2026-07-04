'use client';

import { useLayoutEffect } from 'react';
import { registerWorkspaceBridge } from '@/ui/bridges/workspaceBridge.js';
import { registerViewportBridge } from '@/ui/bridges/viewportBridge.js';
import { registerCanvasSurfaceBridge } from '@/ui/bridges/canvasSurfaceBridge.js';
import { registerNodeCreateBridge } from '@/ui/bridges/nodeCreateBridge.js';
import { registerNodeUpdateBridge } from '@/ui/bridges/nodeUpdateBridge.js';
import { registerAlignmentBridge } from '@/ui/bridges/alignmentBridge.js';
import { registerHistoryBridge } from '@/ui/bridges/historyBridge.js';
import { registerEditEventBridge } from '@/ui/bridges/editEventBridge.js';
import { registerAnimationKeyframeBridge } from '@/ui/bridges/animationKeyframeBridge.js';
import { registerMotionBridge } from '@/ui/bridges/motionBridge.js';
import { registerLayoutConvertBridge } from '@/ui/bridges/layoutConvertBridge.js';
import { registerTimelineBridge } from '@/ui/bridges/timelineBridge.js';
import { registerExportIntentBridge } from '@/ui/bridges/exportIntentBridge.js';
import { registerShotEditorBridge } from '@/ui/bridges/shotEditorBridge.js';
import { registerTokenAuthoringBridge } from '@/ui/bridges/tokenAuthoringBridge.js';
import { registerToolIntentBridge } from '@/ui/bridges/toolIntentBridge.js';
import { registerCapabilityToolBridge } from '@/ui/bridges/capabilityToolBridge.js';
import { registerSelectionIntentBridge } from '@/ui/bridges/selectionIntentBridge.js';
import { registerInputIntentBridge } from '@/ui/bridges/inputIntentBridge.js';
import { registerCommandIntentBridge } from '@/ui/bridges/commandIntentBridge.js';
import {
  registerDefaultGraphToolHandlers,
  unregisterDefaultGraphToolHandlers,
} from '@/ui/bridges/toolHandlerRegistrationFacade.js';

export function RuntimeBridgesRoot({ dispatcher = null }) {
  useLayoutEffect(() => {
    if (!dispatcher?.dispatch) return;

    registerDefaultGraphToolHandlers();

    const disposers = [
      registerWorkspaceBridge(dispatcher),
      registerViewportBridge(dispatcher),
      registerCanvasSurfaceBridge(dispatcher),
      registerNodeCreateBridge(dispatcher),
      registerNodeUpdateBridge(dispatcher),
      registerAlignmentBridge(dispatcher),
      registerHistoryBridge(dispatcher),
      registerEditEventBridge(dispatcher),
      registerAnimationKeyframeBridge(dispatcher),
      registerMotionBridge(dispatcher),
      registerLayoutConvertBridge(dispatcher),
      registerTimelineBridge(dispatcher),
      registerExportIntentBridge(dispatcher),
      registerShotEditorBridge(dispatcher),
      registerTokenAuthoringBridge(dispatcher),
      registerToolIntentBridge(dispatcher),
      registerCapabilityToolBridge(dispatcher),
      registerSelectionIntentBridge(dispatcher),
      registerInputIntentBridge(),
      registerCommandIntentBridge(dispatcher),
    ];

    return () => {
      disposers.forEach((dispose) => dispose?.());
      unregisterDefaultGraphToolHandlers();
    };
  }, [dispatcher]);

  return null;
}

export default RuntimeBridgesRoot;
