'use client';

import { useSyncExternalStore } from 'react';
import { getWorkspaceState, subscribeWorkspaceState } from './workspaceState.js';

export function useWorkspaceState(selector = (state) => state) {
    return useSyncExternalStore(
        subscribeWorkspaceState,
        () => selector(getWorkspaceState()),
        () => selector(getWorkspaceState()),
    );
}
