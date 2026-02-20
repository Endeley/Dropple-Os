import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

export function replayBranch(branch, initialState, { dispatcher } = {}) {
    const activeDispatcher = dispatcher ?? getRuntimeDispatcher();

    if (initialState) {
        activeDispatcher.hydrateRuntimeState(initialState, { animate: false });
    }

    activeDispatcher.setReplaying?.(true);

    for (const event of branch?.events || []) {
        if (!event) continue;
        const { id, ...sanitized } = event;
        activeDispatcher.dispatch?.(sanitized);
    }

    activeDispatcher.setReplaying?.(false);
    return activeDispatcher.getState?.();
}
