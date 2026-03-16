import { getNodeDependencies, validateGraph } from './graphValidation.js';

function getGraphNodes(graph) {
    if (Array.isArray(graph?.nodes)) return graph.nodes;

    const nodes = graph?.nodes;
    return nodes && typeof nodes === 'object' ? Object.values(nodes) : [];
}

function buildNodeMap(nodes) {
    const map = new Map();

    for (const node of nodes) {
        const id = node?.id ?? null;
        if (!id) {
            throw new Error('Animation graph node is missing id');
        }
        if (map.has(id)) {
            throw new Error(`Duplicate animation graph node id: ${id}`);
        }
        map.set(id, node);
    }

    return map;
}

function topologicalSort({ output, nodeMap }) {
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    function visit(nodeId) {
        if (visited.has(nodeId)) return;

        if (visiting.has(nodeId)) {
            throw new Error(`Animation graph cycle detected at node: ${nodeId}`);
        }

        const node = nodeMap.get(nodeId);
        if (!node) {
            throw new Error(`Animation graph references missing node: ${nodeId}`);
        }

        visiting.add(nodeId);

        for (const dep of getNodeDependencies(node)) {
            visit(dep);
        }

        visiting.delete(nodeId);
        visited.add(nodeId);
        order.push(nodeId);
    }

    visit(output);

    return order;
}

function normalizeOutput(output, nodeMap) {
    if (output == null) {
        throw new Error('Animation graph is missing output');
    }

    if (typeof output === 'string') {
        if (!nodeMap.has(output)) {
            throw new Error(`Animation graph output references missing node: ${output}`);
        }

        return {
            kind: 'node',
            nodeId: output,
        };
    }

    if (Array.isArray(output)) {
        const nodeIds = output.slice();

        for (const nodeId of nodeIds) {
            if (!nodeMap.has(nodeId)) {
                throw new Error(`Animation graph output references missing node: ${nodeId}`);
            }
        }

        return {
            kind: 'nodes',
            nodeIds,
        };
    }

    throw new Error('Animation graph output must be a node id or array of node ids');
}

function collectOutputRoots(normalizedOutput) {
    if (normalizedOutput.kind === 'node') return [normalizedOutput.nodeId];
    if (normalizedOutput.kind === 'nodes') return normalizedOutput.nodeIds.slice();
    return [];
}

export function compileGraph(graph) {
    validateGraph(graph);

    const id = graph?.id ?? null;
    if (!id) {
        throw new Error('Animation graph is missing id');
    }

    const nodes = getGraphNodes(graph);
    const nodeMap = buildNodeMap(nodes);
    const output = normalizeOutput(graph?.output, nodeMap);
    const outputRoots = collectOutputRoots(output);
    const order = [];
    const seen = new Set();

    for (const rootId of outputRoots) {
        const partialOrder = topologicalSort({
            output: rootId,
            nodeMap,
        });

        for (const nodeId of partialOrder) {
            if (seen.has(nodeId)) continue;
            seen.add(nodeId);
            order.push(nodeId);
        }
    }

    return {
        id,
        order,
        nodeMap,
        output,
        contract: {
            type: 'blend-layers',
            layerShape: {
                id: 'string',
                mode: 'replace|add|multiply|override',
                weight: 'number',
                channels: [
                    {
                        controllerId: 'string',
                        channel: 'string',
                        value: 'number',
                    },
                ],
            },
        },
    };
}
