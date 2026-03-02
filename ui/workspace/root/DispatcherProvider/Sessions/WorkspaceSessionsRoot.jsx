'use client';

import { useEffect } from 'react';
import { registerSessionBindings } from '@/ui/interaction/sessionBinding.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

export function WorkspaceSessionsRoot() {
  useEffect(() => {
    const dispatcher = getRuntimeDispatcher();
    if (!dispatcher?.dispatch) return undefined;
    return registerSessionBindings(dispatcher.dispatch);
  }, []);

  return null;
}
