'use client';

function getGraphNode(graph, nodeId) {
    if (Array.isArray(graph?.nodes)) {
        return graph.nodes.find((node) => node?.id === nodeId) ?? null;
    }

    if (graph?.nodes && typeof graph.nodes === 'object') {
        return graph.nodes[nodeId] ?? null;
    }

    return null;
}

export function isSupportedInputName(input) {
    if (input === 'input' || input === 'a' || input === 'b') {
        return true;
    }

    return /^input-\d+$/.test(String(input));
}

export function getConnectionValue(node, input) {
    if (input === 'input' || input === 'a' || input === 'b') {
        return node?.[input] ?? null;
    }

    const arrayMatch = /^input-(\d+)$/.exec(String(input));
    if (!arrayMatch) return null;

    const index = Number(arrayMatch[1]);
    return Array.isArray(node?.inputs) ? node.inputs[index] ?? null : null;
}

export function canConnect({ from, to, input, graph }) {
    if (!from || !to || !input || !graph) return false;
    if (from === to) return false;
    if (!isSupportedInputName(input)) return false;

    const target = getGraphNode(graph, to);
    if (!target) return false;

    const current = getConnectionValue(target, input);
    if (current && current !== from) return false;

    return true;
}
