import { safeNumber } from '../blending/blendUtils.js';
import { getNodeEvaluator } from './graphNodes.js';

function isChannel(entry) {
    return Boolean(entry?.controllerId) && Boolean(entry?.channel);
}

function normalizeLayer(layer, graphId, index = 0) {
    return {
        id: layer?.id ?? `graph:${graphId}:layer:${index}`,
        mode: layer?.mode ?? 'replace',
        weight: safeNumber(layer?.weight ?? 1),
        channels: Array.isArray(layer?.channels) ? layer.channels : [],
    };
}

function normalizeToLayers(output, graphId) {
    if (!output) return [];

    if (Array.isArray(output) && output.every(isChannel)) {
        return [
            normalizeLayer(
                {
                    id: `graph:${graphId}:layer`,
                    mode: 'replace',
                    weight: 1,
                    channels: output,
                },
                graphId
            ),
        ];
    }

    if (Array.isArray(output)) {
        return output
            .filter(Boolean)
            .map((layer, index) => normalizeLayer(layer, graphId, index));
    }

    if (Array.isArray(output?.channels)) {
        return [normalizeLayer(output, graphId)];
    }

    return [];
}

function resolveInputs(node, results) {
    const inputs = [];

    if (node?.input) inputs.push(results[node.input]);
    if (node?.a) inputs.push(results[node.a]);
    if (node?.b) inputs.push(results[node.b]);

    if (Array.isArray(node?.inputs)) {
        for (const inputId of node.inputs) {
            inputs.push(results[inputId]);
        }
    }

    return inputs.map((value) => value ?? []);
}

function evaluateNode(node, context, results) {
    const evaluator = getNodeEvaluator(node?.type);
    return evaluator(node, context, resolveInputs(node, results));
}

function resolveOutput(compiledGraph, results) {
    const output = compiledGraph?.output;

    if (output?.kind === 'node') {
        return results[output.nodeId] ?? [];
    }

    if (output?.kind === 'nodes') {
        return output.nodeIds.flatMap((nodeId) => results[nodeId] ?? []);
    }

    return [];
}

export function evaluateGraph(compiledGraph, context = {}) {
    if (!compiledGraph) return [];

    const { order = [], nodeMap, id } = compiledGraph;
    const results = Object.create(null);

    for (const nodeId of order) {
        const node = nodeMap?.get(nodeId);
        const output = evaluateNode(node, context, results);
        results[nodeId] = normalizeToLayers(output, id);
    }

    return resolveOutput(compiledGraph, results).map((layer, index) =>
        normalizeLayer(layer, id, index)
    );
}
