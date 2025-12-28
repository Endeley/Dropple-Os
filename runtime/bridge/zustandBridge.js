// runtime/bridge/zustandBridge.js

import { useRuntimeStore } from '../stores/useRuntimeStore.js';

/**
 * Syncs authoritative runtime state into Zustand (read-only mirror).
 * ❗ Zustand never mutates runtime directly.
 */
export function syncRuntimeToZustand(nextState) {
    if (!nextState) {
        useRuntimeStore.setState(
            {
                nodes: {},
                rootIds: [],
            },
            false
        );
        return;
    }

    useRuntimeStore.setState(
        {
            nodes: nextState.nodes,
            rootIds: nextState.rootIds,
        },
        false
    );
}
