'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

let lastProjectedState = null;

export function selectProjectedVisualState(state) {
    const nextProjectedState = {
        nodes: state?.viewNodes ?? {},
        rootIds: state?.viewRootIds ?? [],
        sceneGraph: state?.viewSceneGraph ?? null,
        runtimeScene: state?.scene ?? null,
        timeline: state?.timeline ?? null,
        selection: state?.selection ?? { ids: [], primary: null, count: 0 },
        selectionBounds: state?.selectionBounds ?? { bounds: null, center: null },
        transformAnchors: state?.transformAnchors ?? {
            pivot: null,
            resizeAnchors: null,
            rotateAnchor: null,
        },
        guides: state?.guides ?? [],
        marquee: state?.marquee ?? null,
        groupTransform: state?.groupTransform ?? null,
        graph: state?.graph ?? null,
    };

    if (
        lastProjectedState &&
        lastProjectedState.nodes === nextProjectedState.nodes &&
        lastProjectedState.rootIds === nextProjectedState.rootIds &&
        lastProjectedState.sceneGraph === nextProjectedState.sceneGraph &&
        lastProjectedState.runtimeScene === nextProjectedState.runtimeScene &&
        lastProjectedState.timeline === nextProjectedState.timeline &&
        lastProjectedState.selection === nextProjectedState.selection &&
        lastProjectedState.selectionBounds === nextProjectedState.selectionBounds &&
        lastProjectedState.transformAnchors === nextProjectedState.transformAnchors &&
        lastProjectedState.guides === nextProjectedState.guides &&
        lastProjectedState.marquee === nextProjectedState.marquee &&
        lastProjectedState.groupTransform === nextProjectedState.groupTransform &&
        lastProjectedState.graph === nextProjectedState.graph
    ) {
        return lastProjectedState;
    }

    lastProjectedState = nextProjectedState;
    return nextProjectedState;
}

/**
 * Reads from the projected UI mirror only.
 * This keeps visual consumers off the generic runtime hook while the
 * projection bridge continues to populate the underlying Zustand store.
 */
export function useWorkspaceVisualState(selector = (state) => state) {
    const projectedState = useRuntimeStore(selectProjectedVisualState);
    return useMemo(() => selector(projectedState), [projectedState, selector]);
}
