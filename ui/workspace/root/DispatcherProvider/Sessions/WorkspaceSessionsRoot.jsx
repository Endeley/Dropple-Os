'use client';

import { useEffect } from 'react';
import { useDispatcher } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';
import { registerSessionBindings } from '@/ui/interaction/sessionBinding.js';

export function WorkspaceSessionsRoot() {
  const dispatcher = useDispatcher();

  useEffect(() => {
    if (!dispatcher?.dispatch) return undefined;
    return registerSessionBindings(dispatcher.dispatch);
  }, [dispatcher]);

  return null;
}
