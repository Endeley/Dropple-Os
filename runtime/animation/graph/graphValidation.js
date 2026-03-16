function getGraphNodes(graph) {
    if (Array.isArray(graph?.nodes)) return graph.nodes;

    const nodes = graph?.nodes;
    return nodes && typeof nodes === 'object' ? Object.values(nodes) : [];
}

function buildNodeMap(nodes) {
    const nodeMap = new Map();

    for (const node of nodes) {
        const nodeId = node?.id ?? null;
        if (!nodeId) {
            throw new Error('Animation graph node is missing id');
        }
        if (nodeMap.has(nodeId)) {
            throw new Error(`Duplicate animation graph node id: ${nodeId}`);
        }
        nodeMap.set(nodeId, node);
    }

    return nodeMap;
}

export function getNodeDependencies(node) {
    const dependencies = [];

    if (node?.input) dependencies.push(node.input);
    if (node?.a) dependencies.push(node.a);
    if (node?.b) dependencies.push(node.b);

    if (Array.isArray(node?.inputs)) {
        for (const input of node.inputs) {
            if (input) dependencies.push(input);
        }
    }

    return dependencies;
}

function normalizeOutput(output, nodeMap) {
    if (output == null) {
        throw new Error('Animation graph missing output node');
    }

    if (typeof output === 'string') {
        if (!nodeMap.has(output)) {
            throw new Error(`Animation graph output references missing node: ${output}`);
        }
        return [output];
    }

    if (Array.isArray(output)) {
        if (!output.length) {
            throw new Error('Animation graph missing output node');
        }

        const roots = output.slice();
        for (const nodeId of roots) {
            if (!nodeMap.has(nodeId)) {
                throw new Error(`Animation graph output references missing node: ${nodeId}`);
            }
        }
        return roots;
    }

    throw new Error('Animation graph output must be a node id or array of node ids');
}

export function validateGraph(graph) {
    const graphId = graph?.id ?? null;
    if (!graphId) {
        throw new Error('Animation graph is missing id');
    }

    const nodes = getGraphNodes(graph);
    if (!nodes.length) {
        throw new Error('Animation graph has no nodes');
    }

    const nodesById = buildNodeMap(nodes);
    const outputRoots = normalizeOutput(graph?.output, nodesById);
    const visited = new Set();
    const stack = new Set();

    function visit(nodeId) {
        if (stack.has(nodeId)) {
            throw new Error(`Animation graph cycle detected at node: ${nodeId}`);
        }

        if (visited.has(nodeId)) return;

        const node = nodesById.get(nodeId);
        if (!node) {
            throw new Error(`Missing graph node ${nodeId}`);
        }

        stack.add(nodeId);

        for (const dependencyId of getNodeDependencies(node)) {
            if (!nodesById.has(dependencyId)) {
                throw new Error(`Missing graph node ${dependencyId}`);
            }
            visit(dependencyId);
        }

        stack.delete(nodeId);
        visited.add(nodeId);
    }

    for (const outputId of outputRoots) {
        visit(outputId);
    }

    return {
        id: graphId,
        output: graph.output,
        outputRoots,
        visited: Array.from(visited),
    };
}
