// runtime/projection/zustandBridge.js

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

    const prev = useRuntimeStore.getState();
    const nextProjection = {
        nodes: nextState.nodes,
        rootIds: nextState.rootIds,
        workspace: nextState.workspace ?? null,
    };

    if (prev.sceneGraph !== nextState.sceneGraph) {
        nextProjection.sceneGraph = nextState.sceneGraph ?? null;
    }
    if (prev.scene !== nextState.scene) {
        nextProjection.scene = nextState.scene ?? null;
    }

    useRuntimeStore.setState(nextProjection, false);
}
