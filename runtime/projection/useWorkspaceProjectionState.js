'use client';

import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

export const workspaceProjectionStore = {
    getState: () => useRuntimeStore.getState(),
    subscribe: (listener) => useRuntimeStore.subscribe(listener),
};

export function getWorkspaceProjectionState() {
    return workspaceProjectionStore.getState();
}

/**
 * Canonical UI hook for reads from the projected Zustand mirror.
 * Non-bridge UI should import this from `runtime/projection`, never from the raw store.
 */
export function useWorkspaceProjectionState(selector = (state) => state) {
    return useRuntimeStore(selector);
}
