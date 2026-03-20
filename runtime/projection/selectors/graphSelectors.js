function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

function getGraphs(document) {
    if (Array.isArray(document?.graphs)) {
        return document.graphs
            .filter(Boolean)
            .slice()
            .sort((left, right) => stableCompare(left?.id, right?.id));
    }

    if (document?.graphs && typeof document.graphs === 'object') {
        return Object.values(document.graphs)
            .filter(Boolean)
            .sort((left, right) => stableCompare(left?.id, right?.id));
    }

    return [];
}

function getGraphNodes(graph) {
    if (Array.isArray(graph?.nodes)) {
        return graph.nodes.filter(Boolean);
    }

    if (graph?.nodes && typeof graph.nodes === 'object') {
        return Object.values(graph.nodes).filter(Boolean);
    }

    return [];
}

function normalizePosition(position, index) {
    if (position && typeof position === 'object') {
        return {
            x: Number(position.x ?? 0),
            y: Number(position.y ?? 0),
        };
    }

    return {
        x: 48 + (index % 4) * 180,
        y: 48 + Math.floor(index / 4) * 120,
    };
}

function normalizeNodeInputs(node) {
    if (node?.inputs && typeof node.inputs === 'object' && !Array.isArray(node.inputs)) {
        return node.inputs;
    }

    const inputs = {};
    const dependencyKeys = ['input', 'a', 'b'];
    for (const key of dependencyKeys) {
        if (node?.[key]) {
            inputs[key] = {
                nodeId: node[key],
            };
        }
    }

    if (Array.isArray(node?.inputs)) {
        node.inputs.forEach((value, index) => {
            if (!value) return;
            inputs[`input-${index}`] = {
                nodeId: value,
            };
        });
    }

    return inputs;
}

function getExplicitActiveGraphId(state, graphs) {
    const candidates = [
        state?.animation?.activeGraphId,
        state?.workspace?.activeGraphId,
        state?.document?.activeGraphId,
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;
        if (graphs.some((graph) => graph?.id === candidate)) {
            return candidate;
        }
    }

    return graphs[0]?.id ?? null;
}

export function selectGraphs(state) {
    return getGraphs(state?.document);
}

export function selectActiveGraphId(state) {
    return getExplicitActiveGraphId(state, selectGraphs(state));
}

export function selectActiveGraph(state) {
    const graphs = selectGraphs(state);
    const activeGraphId = getExplicitActiveGraphId(state, graphs);

    if (!activeGraphId) return null;
    return graphs.find((graph) => graph?.id === activeGraphId) ?? null;
}

export function selectGraphNodes(state) {
    const graph = selectActiveGraph(state);
    const nodes = getGraphNodes(graph);

    return nodes
        .map((node, index) => ({
            ...node,
            id: node?.id ?? `graph-node-${index}`,
            type: node?.type ?? 'node',
            inputs: normalizeNodeInputs(node),
            params: node?.params ?? {},
            position: normalizePosition(node?.position, index),
        }))
        .sort((left, right) => stableCompare(left.id, right.id));
}

export function selectGraphEdges(state) {
    const graph = selectActiveGraph(state);
    const nodes = getGraphNodes(graph);
    const edges = [];

    for (const node of nodes) {
        const inputs = normalizeNodeInputs(node);

        for (const [inputName, source] of Object.entries(inputs)) {
            const sourceNodeId =
                typeof source === 'string'
                    ? source
                    : source?.nodeId ?? source?.id ?? null;

            if (!sourceNodeId) continue;

            edges.push({
                id: `${sourceNodeId}:${node?.id}:${inputName}`,
                from: sourceNodeId,
                to: node?.id ?? null,
                input: inputName,
            });
        }
    }

    return edges.sort((left, right) => stableCompare(left.id, right.id));
}

export function selectGraphErrors(state) {
    return state?.animation?.graphErrors ?? state?.runtime?.animation?.graphErrors ?? EMPTY_GRAPH_ERRORS;
}
const EMPTY_GRAPH_ERRORS = [];
