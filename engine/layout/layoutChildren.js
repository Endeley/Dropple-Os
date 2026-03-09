import { resolveFlowContainer } from './resolveFlowContainer.js';
import { resolveGridContainer } from './resolveGridContainer.js';
import { resolveConstraintNode } from './resolveConstraintNode.js';
import { buildComputedLayout } from './layoutTypes.js';

function walkSceneGraph(sceneGraph = {}) {
    const ordered = [];
    const visited = new Set();

    function visit(nodeId) {
        if (!nodeId || visited.has(nodeId)) return;
        visited.add(nodeId);
        ordered.push(nodeId);

        const children = sceneGraph?.nodes?.[nodeId]?.children ?? [];
        children.forEach(visit);
    }

    (sceneGraph?.rootIds ?? []).forEach(visit);
    Object.keys(sceneGraph?.nodes ?? {}).forEach(visit);

    return ordered;
}

function buildBaseComputed(nodeGeometry = {}, measured = {}, revision = 0) {
    const computed = {};

    Object.keys(nodeGeometry ?? {}).forEach((nodeId) => {
        const geometry = nodeGeometry?.[nodeId] ?? {};
        const measuredNode = measured?.[nodeId] ?? {};

        computed[nodeId] = buildComputedLayout({
            x: geometry.x ?? 0,
            y: geometry.y ?? 0,
            width: measuredNode.width ?? geometry.width ?? 0,
            height: measuredNode.height ?? geometry.height ?? 0,
            revision,
        });
    });

    Object.keys(measured ?? {}).forEach((nodeId) => {
        if (computed[nodeId]) return;
        const measuredNode = measured[nodeId] ?? {};
        computed[nodeId] = buildComputedLayout({
            x: 0,
            y: 0,
            width: measuredNode.width ?? 0,
            height: measuredNode.height ?? 0,
            revision,
        });
    });

    return computed;
}

function buildMeasuredGeometry(nodeGeometry = {}, measured = {}) {
    return Object.fromEntries(
        Object.keys({ ...nodeGeometry, ...measured }).map((nodeId) => [
            nodeId,
            {
                ...(nodeGeometry?.[nodeId] ?? {}),
                width: measured?.[nodeId]?.width ?? nodeGeometry?.[nodeId]?.width ?? 0,
                height: measured?.[nodeId]?.height ?? nodeGeometry?.[nodeId]?.height ?? 0,
            },
        ]),
    );
}

export function layoutChildren({
    sceneGraph,
    layoutNodes = {},
    nodeGeometry = {},
    measured = {},
} = {}) {
    const diagnostics = [];
    const orderedNodeIds = walkSceneGraph(sceneGraph);
    const measuredGeometry = buildMeasuredGeometry(nodeGeometry, measured);
    let computed = buildBaseComputed(nodeGeometry, measured);
    const affectedNodes = new Set();

    orderedNodeIds.forEach((nodeId) => {
        const layoutNode = layoutNodes?.[nodeId];
        if (!layoutNode) return;

        if (layoutNode.mode === 'flow' && layoutNode.container) {
            const result = resolveFlowContainer({
                containerId: nodeId,
                sceneGraph,
                layoutNodes,
                computed,
                measured,
            });

            computed = result.computed;
            affectedNodes.add(nodeId);
            result.affectedNodes.forEach((affectedId) => affectedNodes.add(affectedId));
            result.diagnostics.forEach((item) => diagnostics.push(item));
            return;
        }

        if (layoutNode.mode === 'grid' && layoutNode.container?.type === 'grid') {
            const result = resolveGridContainer({
                containerId: nodeId,
                sceneGraph,
                layoutNodes,
                computed,
                measured,
            });

            computed = result.computed;
            affectedNodes.add(nodeId);
            result.affectedNodes.forEach((affectedId) => affectedNodes.add(affectedId));
            result.diagnostics.forEach((item) => diagnostics.push(item));
            return;
        }

        if (layoutNode.mode === 'constraint') {
            const parentId = sceneGraph?.nodes?.[nodeId]?.parentId;
            const parentBox = parentId ? computed?.[parentId] ?? measuredGeometry?.[parentId] : null;

            computed = {
                ...computed,
                [nodeId]: resolveConstraintNode({
                    nodeId,
                    parentBox,
                    layoutNode,
                    baseGeometry: measuredGeometry,
                    revision: (computed?.[nodeId]?.revision ?? 0) + 1,
                }),
            };
            affectedNodes.add(nodeId);
        }
    });

    return {
        computed,
        affectedNodes: Array.from(affectedNodes),
        diagnostics,
    };
}
