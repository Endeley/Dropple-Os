import { compileGraph } from './graphCompiler.js';
import { evaluateGraph } from './graphEvaluation.js';
import { resolveGraphParameters } from './resolveGraphParameters.js';

function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

function getGraphCache(runtime) {
    if (!runtime.__graphCache) {
        Object.defineProperty(runtime, '__graphCache', {
            value: new Map(),
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }

    return runtime.__graphCache;
}

function getDocumentGraphs(document) {
    if (!document?.graphs) return [];
    if (Array.isArray(document.graphs)) return document.graphs;
    if (typeof document.graphs === 'object') return Object.values(document.graphs);
    return [];
}

function getCompiledGraph(graph, cache) {
    const id = graph?.id ?? null;
    if (!id) {
        throw new Error('Graph is missing id');
    }

    const cached = cache.get(id);
    if (cached && cached.__source === graph) {
        return cached;
    }

    const compiled = compileGraph(graph);
    Object.defineProperty(compiled, '__source', {
        value: graph,
        enumerable: false,
        writable: true,
        configurable: true,
    });
    cache.set(id, compiled);
    return compiled;
}

export function evaluateGraphs(snapshot, context = {}) {
    const document = snapshot?.document ?? {};
    const runtime = snapshot?.runtime ?? snapshot ?? {};
    const graphs = getDocumentGraphs(document)
        .filter(Boolean)
        .slice()
        .sort((left, right) => stableCompare(left?.id, right?.id));

    if (!graphs.length) return [];

    const cache = getGraphCache(runtime);
    const layers = [];

    for (const graph of graphs) {
        const compiled = getCompiledGraph(graph, cache);
        const parameters = resolveGraphParameters({
            graph,
            injected: context?.parameters,
        });
        const graphLayers = evaluateGraph(compiled, {
            ...context,
            snapshot,
            graphId: graph.id,
            parameters,
        });

        for (const layer of graphLayers) {
            layers.push({
                ...layer,
                id: layer?.id ?? `graph:${graph.id}`,
                rigId: layer?.rigId ?? graph?.rigId ?? null,
            });
        }
    }

    return layers;
}
