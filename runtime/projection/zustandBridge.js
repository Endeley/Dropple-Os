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
import { projectGroupTransform } from '@/runtime/projection/groupTransformProjection.js';
import {
    selectActiveTool,
    selectVisibleToolDefinitions,
    selectVisibleTools,
} from '@/runtime/selectors/toolSelectors.js';
import { projectGraphInteraction } from '@/runtime/graph/index.js';
import { getNodes, getRootIds, getSceneGraph } from '@/runtime/document/documentAdapter.js';
import { projectActiveTokens } from '@/runtime/tokens/projectActiveTokens.js';

function projectMarquee(runtime) {
    const drag = runtime?.interaction?.drag ?? null;
    if (!drag?.active || drag.type !== 'marquee') {
        return null;
    }

    const start = drag.startPointer ?? null;
    const current = drag.currentPointer ?? start ?? null;
    if (!start || !current) {
        return null;
    }

    return Object.freeze({
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
        additive: drag?.meta?.additive === true,
    });
}

/**
 * Syncs authoritative runtime state into Zustand (read-only mirror).
 */
export function syncRuntimeToZustand(nextState, options = {}) {
    const sanitizedUxAudit = Array.isArray(options?.uxAudit)
        ? options.uxAudit.map((entry) => ({
              id: entry?.id,
              type: entry?.type,
              timestamp: entry?.timestamp,
              message: entry?.message,
              level: entry?.level,
          }))
        : [];

    if (!nextState) {
        useRuntimeStore.setState(
            {
        viewNodes: {},
        viewRootIds: [],
        document: null,
        tokens: projectActiveTokens(null),
        timeline: null,
                playback: { isPlaying: false },
                isReplaying: false,
                uxAudit: [],
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
                marquee: null,
                groupTransform: null,
                components: {
                    index: { definitions: {}, instances: {}, instanceOverrides: {} },
                    resolvedInstances: {},
                    counts: { definitions: 0, instances: 0, resolvedInstances: 0 },
                },
                data: { resolvedBindings: {}, resolvedValues: {} },
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
                collaboration: { session: null, presence: [], cursors: [] },
                ai: { requests: [], latestRequest: null },
                graph: projectGraphInteraction(nextState),
                tools: {
                    activeTool: 'select',
                    registeredTools: {},
                    visibleTools: [],
                },
                interaction: null,
                events: [],
                cursorIndex: -1,
            },
            false,
        );
        return;
    }

    const prev = useRuntimeStore.getState();
    const nodesById = getNodes(nextState);

    const interactionTransforms = nextState?.interaction?.drag?.active === true ? (nextState?.interaction?.drag?.interactionTransforms ?? null) : null;

    const projectedNodes = {};

    Object.keys(nodesById).forEach((id) => {
        const node = nodesById[id];
        if (!node) return;

        const interaction = interactionTransforms?.[id] ?? null;
        const baseLayout = node.layout ?? {};

        // 🔥 FIX: include width + height
        const projectedLayout = interaction
            ? {
                  ...baseLayout,
                  x: interaction.x ?? baseLayout.x ?? node.x ?? 0,
                  y: interaction.y ?? baseLayout.y ?? node.y ?? 0,
                  width: interaction.width ?? baseLayout.width ?? node.width ?? 0,
                  height: interaction.height ?? baseLayout.height ?? node.height ?? 0,
              }
            : baseLayout;

        projectedNodes[id] = {
            ...node,

            ...(interaction
                ? {
                      x: interaction.x ?? node.x,
                      y: interaction.y ?? node.y,

                      // 🔥 CRITICAL FIX
                      width: interaction.width ?? node.width,
                      height: interaction.height ?? node.height,

                      transform: {
                          ...(node.transform ?? {}),
                          ...interaction,
                      },

                      layout: projectedLayout,
                  }
                : {}),

            isAutoLayoutChild: computeIsAutoLayoutChild(node, nodesById),
            resizeLocked: computeIsAutoLayoutChild(node, nodesById),
        };
    });

    const selectionBounds = selectionBoundsProjection(nextState);

    const nextProjection = {
        viewNodes: projectedNodes,
        viewRootIds: getRootIds(nextState),
        document: nextState.document ?? null,
        tokens: projectActiveTokens(nextState.document),
        workspace: nextState.workspace ?? null,
        timeline: nextState.timeline ?? null,
        playback: nextState.playback ?? { isPlaying: false },
        isReplaying: nextState.__isReplaying === true,
        uxAudit: sanitizedUxAudit,
        selection: selectionProjection(nextState),
        clipboard: clipboardProjection(nextState),
        grouping: groupProjection(nextState),
        selectionBounds,
        transformAnchors: transformAnchorProjection(selectionBounds),
        guides: guideProjection(nextState, selectionBounds),
        marquee: projectMarquee(nextState),
        groupTransform: projectGroupTransform(nextState),
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
            presence: Object.values(nextState.collaboration?.presence ?? {}),
            cursors: Object.entries(nextState.collaboration?.cursors ?? {}).map(([userId, cursor]) => ({
                userId,
                ...cursor,
            })),
        },
        ai: {
            requests: (nextState.ai?.order ?? []).map((id) => nextState.ai?.requests?.[id]).filter(Boolean),
            latestRequest: (() => {
                const order = nextState.ai?.order ?? [];
                const latestId = order[order.length - 1];
                return latestId ? nextState.ai?.requests?.[latestId] : null;
            })(),
        },
        graph: projectGraphInteraction(nextState),

        tools: {
            activeTool: selectActiveTool(nextState),
            registeredTools: nextState.tools?.registeredTools ?? {},
            visibleToolDefinitions: selectVisibleToolDefinitions(nextState),
            visibleTools: selectVisibleTools(nextState),
        },

        interaction: nextState.interaction ?? null,
        events: Array.isArray(nextState.events) ? nextState.events : [],
        cursorIndex: Number.isFinite(nextState.cursorIndex) ? nextState.cursorIndex : -1,
    };

    const nextSceneGraph = getSceneGraph(nextState);
    if (prev.viewSceneGraph !== nextSceneGraph) {
        nextProjection.viewSceneGraph = nextSceneGraph;
    }

    if (prev.scene !== nextState.scene) {
        nextProjection.scene = nextState.scene ?? null;
    }

    useRuntimeStore.setState(nextProjection, false);
}
