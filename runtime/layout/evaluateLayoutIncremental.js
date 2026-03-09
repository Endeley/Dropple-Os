import { evaluateLayout } from '@/engine/layout/evaluateLayout.js';
import { collectLayoutRoots } from './collectLayoutRoots.js';

function collectDescendants(sceneGraph, nodeId, collected = new Set()) {
    if (!nodeId || collected.has(nodeId)) return collected;
    collected.add(nodeId);

    const children = sceneGraph?.nodes?.[nodeId]?.children ?? [];
    children.forEach((childId) => collectDescendants(sceneGraph, childId, collected));

    return collected;
}

function buildSliceForRoot({ rootId, sceneGraph, layoutNodes, nodeGeometry }) {
    const subtreeNodeIds = collectDescendants(sceneGraph, rootId);
    const rootLayoutNode = layoutNodes?.[rootId];
    const parentId = sceneGraph?.nodes?.[rootId]?.parentId;
    const includeParentContext = rootLayoutNode?.mode === 'constraint' && parentId;

    if (includeParentContext) {
        subtreeNodeIds.add(parentId);
    }

    const nodes = Object.fromEntries(
        Array.from(subtreeNodeIds).map((nodeId) => {
            const node = sceneGraph?.nodes?.[nodeId];
            return [
                nodeId,
                {
                    ...node,
                    children: (node?.children ?? []).filter((childId) => subtreeNodeIds.has(childId)),
                },
            ];
        }),
    );

    const slicedLayoutNodes = Object.fromEntries(
        Array.from(subtreeNodeIds)
            .filter((nodeId) => !includeParentContext || nodeId !== parentId)
            .map((nodeId) => [nodeId, layoutNodes?.[nodeId]])
            .filter(([, layoutNode]) => layoutNode != null),
    );

    const slicedGeometry = Object.fromEntries(
        Array.from(subtreeNodeIds).map((nodeId) => [nodeId, nodeGeometry?.[nodeId] ?? {}]),
    );

    return {
        sceneGraph: {
            rootIds: includeParentContext ? [parentId] : [rootId],
            nodes,
        },
        layoutNodes: slicedLayoutNodes,
        nodeGeometry: slicedGeometry,
    };
}

export function evaluateLayoutIncremental({
    dirtyNodeIds = [],
    sceneGraph,
    layoutNodes = {},
    nodeGeometry = {},
    previousComputed = {},
} = {}) {
    const roots = collectLayoutRoots({
        dirtyNodeIds,
        sceneGraph,
        layoutNodes,
    });

    const mergedComputed = { ...(previousComputed ?? {}) };
    const diagnostics = [];
    const affectedNodes = new Set();

    roots.forEach((rootId) => {
        const slice = buildSliceForRoot({
            rootId,
            sceneGraph,
            layoutNodes,
            nodeGeometry,
        });

        const result = evaluateLayout({
            sceneGraph: slice.sceneGraph,
            layoutNodes: slice.layoutNodes,
            nodeGeometry: slice.nodeGeometry,
            dirtyNodes: [rootId],
            fullPass: false,
        });

        (result.affectedNodes ?? []).forEach((nodeId) => {
            if (result.computed?.[nodeId]) {
                mergedComputed[nodeId] = result.computed[nodeId];
                affectedNodes.add(nodeId);
            }
        });

        (result.diagnostics ?? []).forEach((item) => diagnostics.push(item));
    });

    return {
        roots,
        computed: mergedComputed,
        affectedNodes: Array.from(affectedNodes),
        diagnostics,
    };
}
