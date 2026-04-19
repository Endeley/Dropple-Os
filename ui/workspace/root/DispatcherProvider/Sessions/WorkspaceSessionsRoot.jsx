'use client';

import { useEffect } from 'react';
import { registerSessionBindings } from '@/ui/interaction/sessionBinding.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';

export function WorkspaceSessionsRoot({ modeId = null }) {
  const dispatcher = useDispatcher();

  useEffect(() => {
    let cleanup = null;

    if (dispatcher?.dispatch) {
      cleanup = registerSessionBindings(dispatcher);
    }

    return () => {
      cleanup?.();
    };
  }, [dispatcher, modeId]);

  return null;
}
