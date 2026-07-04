'use client';

import { useEffect } from 'react';
import { registerSessionBindings } from '@/ui/interaction/sessionBinding.js';

export function WorkspaceSessionsRoot({ dispatcher = null, modeId = null }) {
  useEffect(() => {
    const cleanup = dispatcher?.dispatch ? registerSessionBindings(dispatcher) : null;

    return () => {
      cleanup?.();
    };
  }, [dispatcher, modeId]);

  return null;
}
