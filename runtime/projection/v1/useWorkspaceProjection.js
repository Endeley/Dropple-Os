'use client';

import { useSyncExternalStore } from 'react';
import { getWorkspaceProjection } from './workspaceProjection.js';
import { subscribeWorkspaceState } from '../../state/workspaceState.js';

export function useWorkspaceProjection(selector = (state) => state) {
    return useSyncExternalStore(
        subscribeWorkspaceState,
        () => selector(getWorkspaceProjection()),
        () => selector(getWorkspaceProjection()),
    );
}
