import { createNode } from '@/core/nodes/createNode.js';
import { normalizeNodeShape } from '@/design/state/normalizeNodeShape.js';

export function buildRuntimeSnapshotFromTemplateGraph(graph) {
    if (!graph) {
        throw new Error('Missing template graph.');
    }

    const { rootId, nodes, tree } = graph;

    if (!rootId || !Array.isArray(nodes) || !tree) {
        throw new Error('Invalid template graph shape.');
    }

    if (!nodes.find((node) => node.id === rootId)) {
        throw new Error('rootId does not exist in template nodes.');
    }

    const nodesById = {};
    const parentById = {};

    for (const [parentId, children] of Object.entries(tree)) {
        for (const childId of children) {
            parentById[childId] = parentId;
        }
    }

    for (const node of nodes) {
        const parentId = parentById[node.id] ?? null;

        nodesById[node.id] = createNode(
            normalizeNodeShape({
                id: node.id,
                type: node.type || 'frame',
                parentId,
            }),
        );
    }

    return {
        nodes: nodesById,
        rootIds: [rootId],
        scene: {
            activeSceneId: null,
            activeShotId: null,
            camera: null,
        },
        timeline: null,
    };
}
