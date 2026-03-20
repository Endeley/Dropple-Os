import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { hydrateRuntimeSnapshot } from '@/runtime/commands/hydrateRuntimeSnapshot.js';

export function usePersistenceBridgeState(selector) {
    return useRuntimeStore(selector);
}

export function hydratePersistenceSnapshot({
    dispatcher,
    snapshot,
    animate = false,
    workspace,
    mode,
}) {
    return hydrateRuntimeSnapshot({
        dispatcher,
        snapshot,
        animate,
        workspace,
        mode,
    });
}
