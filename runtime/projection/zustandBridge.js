// runtime/projection/zustandBridge.js

import { useRuntimeStore } from '../stores/useRuntimeStore.js';
import { computeIsAutoLayoutChild } from '../layout/computeIsAutoLayoutChild.js';
import { clipboardProjection } from '@/runtime/clipboard/clipboardProjection.js';
import { componentProjection } from '@/runtime/components/componentProjection.js';
import { groupProjection } from '@/runtime/grouping/groupProjection.js';
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
                clipboard: { count: 0, hasData: false },
                grouping: { count: 0 },
                selectionBounds: { bounds: null, center: null },
                transformAnchors: {
                    pivot: null,
                    resizeAnchors: null,
                    rotateAnchor: null,
                },
                guides: [],
                components: {
                    index: {
                        definitions: {},
                        instances: {},
                        instanceOverrides: {},
                    },
                    resolvedInstances: {},
                    counts: {
                        definitions: 0,
                        instances: 0,
                        resolvedInstances: 0,
                    },
                },
                data: {
                    resolvedBindings: {},
                    resolvedValues: {},
                },
                app: {
                    screens: {},
                    currentScreen: null,
                    resolvedScreen: null,
                    state: {},
                    flows: {},
                },
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
        clipboard: clipboardProjection(nextState),
        grouping: groupProjection(nextState),
        selectionBounds,
        transformAnchors: transformAnchorProjection(selectionBounds),
        guides: guideProjection(nextState, selectionBounds),
        components: componentProjection(nextState),
        data: nextState.data ?? { resolvedBindings: {}, resolvedValues: {} },
        app: nextState.app ?? {
            screens: {},
            currentScreen: null,
            resolvedScreen: null,
            state: {},
            flows: {},
        },
    };

    if (prev.sceneGraph !== nextState.sceneGraph) {
        nextProjection.sceneGraph = nextState.sceneGraph ?? null;
    }
    if (prev.scene !== nextState.scene) {
        nextProjection.scene = nextState.scene ?? null;
    }

    useRuntimeStore.setState(nextProjection, false);
}
