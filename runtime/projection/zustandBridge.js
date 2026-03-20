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
import { selectActiveTool, selectVisibleTools } from '@/runtime/selectors/toolSelectors.js';

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
                document: null,
                timeline: null,
                playback: { isPlaying: false },
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
                vectors: {},
                stateMachines: {},
                navigation: {},
                collaboration: {
                    session: null,
                    presence: [],
                    cursors: [],
                },
                ai: {
                    requests: [],
                    latestRequest: null,
                },
                tools: {
                    activeTool: 'select',
                    registeredTools: {},
                    visibleTools: [],
                },
                interaction: null,
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
        document: nextState.document ?? null,
        workspace: nextState.workspace ?? null,
        timeline: nextState.timeline ?? null,
        playback: nextState.playback ?? { isPlaying: false },
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
        vectors: nextState.vectors ?? nextState.document?.vectors ?? {},
        stateMachines: nextState.stateMachines ?? {},
        navigation: nextState.navigation ?? {},
        collaboration: {
            session: nextState.collaboration?.session ?? null,
            presence: Object.values(nextState.collaboration?.presence ?? {}).sort((a, b) =>
                String(a?.id ?? '').localeCompare(String(b?.id ?? ''))
            ),
            cursors: Object.entries(nextState.collaboration?.cursors ?? {})
                .map(([userId, cursor]) => ({
                    userId,
                    ...cursor,
                }))
                .sort((a, b) => String(a.userId).localeCompare(String(b.userId))),
        },
        ai: {
            requests: (nextState.ai?.order ?? [])
                .map((requestId) => nextState.ai?.requests?.[requestId] ?? null)
                .filter(Boolean),
            latestRequest: (() => {
                const order = nextState.ai?.order ?? [];
                const latestId = order.length ? order[order.length - 1] : null;
                return latestId ? nextState.ai?.requests?.[latestId] ?? null : null;
            })(),
        },
        tools: {
            activeTool: selectActiveTool(nextState),
            registeredTools: nextState.tools?.registeredTools ?? {},
            visibleTools: selectVisibleTools(nextState),
        },
        interaction: nextState.interaction ?? null,
    };

    if (prev.sceneGraph !== nextState.sceneGraph) {
        nextProjection.sceneGraph = nextState.sceneGraph ?? null;
    }
    if (prev.scene !== nextState.scene) {
        nextProjection.scene = nextState.scene ?? null;
    }

    useRuntimeStore.setState(nextProjection, false);
}
