import { evaluateLayout } from '@/engine/layout/evaluateLayout.js';
import { evaluateLayoutIncremental } from './evaluateLayoutIncremental.js';
import {
    getLayout,
    getSceneGraph,
    resolveLayoutNode,
} from '../document/documentAdapter.js';

function buildNodeGeometry(nodes = {}) {
    return Object.fromEntries(
        Object.entries(nodes).map(([nodeId, node]) => {
            const transform = node?.props?.transform ?? {};
            const layout = node?.layout ?? {};

            const x = layout.x ?? node?.x ?? transform.x ?? 0;
            const y = layout.y ?? node?.y ?? transform.y ?? 0;
            const width = layout.width ?? node?.width ?? transform.width ?? 0;
            const height = layout.height ?? node?.height ?? transform.height ?? 0;

            return [
                nodeId,
                {
                    x,
                    y,
                    width,
                    height,
                },
            ];
        }),
    );
}

function buildLayoutNodes(runtimeState, sceneGraph) {
    return Object.fromEntries(
        Object.keys(sceneGraph?.nodes ?? {}).map((nodeId) => [
            nodeId,
            resolveLayoutNode(runtimeState, nodeId),
        ]),
    );
}

function applyComputedToNodes(nodes = {}, computed = {}) {
    const nextNodes = {};

    Object.entries(nodes).forEach(([nodeId, node]) => {
        const layoutBox = computed?.[nodeId] ?? null;
        if (!layoutBox) {
            nextNodes[nodeId] = node;
            return;
        }

        nextNodes[nodeId] = {
            ...node,
            x: layoutBox.x,
            y: layoutBox.y,
            width: layoutBox.width,
            height: layoutBox.height,
            layout: {
                ...(node?.layout ?? {}),
                x: layoutBox.x,
                y: layoutBox.y,
                width: layoutBox.width,
                height: layoutBox.height,
            },
        };
    });

    return nextNodes;
}

export function applyLayoutPass(runtimeState) {
    const sceneGraph = getSceneGraph(runtimeState);
    const layout = getLayout(runtimeState);

    if (!runtimeState || !sceneGraph?.nodes || !layout) {
        return {
            nextState: runtimeState,
            derived: {
                nodes: runtimeState?.nodes ?? {},
                rootIds: runtimeState?.rootIds ?? [],
            },
        };
    }

    const layoutNodes = buildLayoutNodes(runtimeState, sceneGraph);
    const nodeGeometry = buildNodeGeometry(sceneGraph.nodes);
    const dirty = layout.dirty ?? {
        nodeIds: [],
        fullPass: false,
        revision: 0,
    };

    const result = evaluateLayout({
        sceneGraph,
        layoutNodes,
        nodeGeometry,
        dirtyNodes: dirty.nodeIds ?? [],
        fullPass: dirty.fullPass === true,
    });
    const layoutResult =
        dirty.fullPass === true
            ? result
            : evaluateLayoutIncremental({
                  dirtyNodeIds: dirty.nodeIds ?? [],
                  sceneGraph,
                  layoutNodes,
                  nodeGeometry,
                  previousComputed: layout.computed ?? {},
              });

    const computed = layoutResult.computed ?? {};
    const derivedNodes = applyComputedToNodes(sceneGraph.nodes, computed);
    const nextState = {
        ...runtimeState,
        document: {
            ...runtimeState.document,
            layout: {
                ...layout,
                computed,
                dirty: {
                    ...dirty,
                    nodeIds: [],
                    fullPass: false,
                },
            },
        },
        nodes: derivedNodes,
        rootIds: sceneGraph.rootIds ?? [],
    };

    return {
        nextState,
        derived: {
            nodes: derivedNodes,
            rootIds: sceneGraph.rootIds ?? [],
        },
        diagnostics: layoutResult.diagnostics ?? [],
        affectedNodes: layoutResult.affectedNodes ?? [],
    };
}
