// runtime/projection/zustandBridge.js

import { useRuntimeStore } from '../stores/useRuntimeStore.js';
import { computeIsAutoLayoutChild } from '../layout/computeIsAutoLayoutChild.js';
import { selectionProjection } from '@/runtime/selection/selectionProjection.js';
import { selectionBoundsProjection } from '@/runtime/selectionBounds/selectionBoundsProjection.js';
import { transformAnchorProjection } from '@/runtime/transforms/transformAnchorProjection.js';
import { guideProjection } from '@/runtime/guides/guideProjection.js';

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
                selection: { ids: [], primary: null, count: 0 },
                selectionBounds: { bounds: null, center: null },
                transformAnchors: {
                    pivot: null,
                    resizeAnchors: null,
                    rotateAnchor: null,
                },
                guides: [],
            },
            false
        );
        return;
    }

    const prev = useRuntimeStore.getState();
    const nodesById = nextState.nodes || {};
    const projectedNodes = {};

    Object.keys(nodesById).forEach((id) => {
        const node = nodesById[id];
        if (!node) return;
        projectedNodes[id] = {
            ...node,
            isAutoLayoutChild: computeIsAutoLayoutChild(node, nodesById),
            resizeLocked: computeIsAutoLayoutChild(node, nodesById),
        };
    });

    const selectionBounds = selectionBoundsProjection(nextState);
    const nextProjection = {
        nodes: projectedNodes,
        rootIds: nextState.rootIds,
        workspace: nextState.workspace ?? null,
        selection: selectionProjection(nextState),
        selectionBounds,
        transformAnchors: transformAnchorProjection(selectionBounds),
        guides: guideProjection(nextState, selectionBounds),
    };

    if (prev.sceneGraph !== nextState.sceneGraph) {
        nextProjection.sceneGraph = nextState.sceneGraph ?? null;
    }
    if (prev.scene !== nextState.scene) {
        nextProjection.scene = nextState.scene ?? null;
    }

    useRuntimeStore.setState(nextProjection, false);
}
