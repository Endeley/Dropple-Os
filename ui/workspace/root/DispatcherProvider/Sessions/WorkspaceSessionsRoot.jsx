'use client';

import { useEffect, useMemo } from 'react';
import { registerSessionBindings } from '@/ui/interaction/sessionBinding.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { workspaceIntentSetActive } from '@/ui/workspace/workspaceIntent.js';
import {
  getWorkspaceContractDefinition,
  resolveWorkspaceId,
} from '@/ui/bridges/workspaceActivationFacade.js';

export function WorkspaceSessionsRoot({ modeId = null }) {
  const dispatcher = useDispatcher();
  const normalizedId = useMemo(() => (modeId ? resolveWorkspaceId(modeId) : null), [modeId]);
  const workspaceDef = useMemo(() => {
    if (!normalizedId) return null;
    return getWorkspaceContractDefinition(normalizedId);
  }, [normalizedId]);

  useEffect(() => {
    let cleanup = null;

    if (dispatcher?.dispatch) {
      cleanup = registerSessionBindings(dispatcher);
    }

    return () => {
      cleanup?.();
    };
  }, [dispatcher]);

  useEffect(() => {
    if (!dispatcher?.dispatch) return;
    if (!workspaceDef?.id) return;
    console.log('Activating workspace:', normalizedId);
    workspaceIntentSetActive({
      id: workspaceDef.id,
      workspaceDef,
    });
  }, [dispatcher, workspaceDef]);

  return null;
}
