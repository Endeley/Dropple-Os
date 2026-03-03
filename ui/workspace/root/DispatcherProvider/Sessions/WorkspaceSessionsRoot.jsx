'use client';

import { useEffect, useMemo } from 'react';
import { registerSessionBindings } from '@/ui/interaction/sessionBinding.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';
import { workspaceIntentSetActive } from '@/ui/workspace/workspaceIntent.js';

export function WorkspaceSessionsRoot({ modeId = null }) {
  const dispatcher = useDispatcher();
  const normalizedId = useMemo(
    () => (modeId ? String(modeId).toLowerCase() : null),
    [modeId]
  );
  const workspaceDef = useMemo(() => {
    if (!normalizedId) return null;
    const resolved = resolveWorkspacePolicy(normalizedId);
    if (!resolved || resolved?.error) return null;
    return adaptWorkspaceToContractV1(resolved);
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
