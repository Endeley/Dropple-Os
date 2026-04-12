import { compileGraph } from './graphCompiler.js';
import { evaluateGraph } from './graphEvaluation.js';
import { resolveGraphParameters } from './resolveGraphParameters.js';

function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

function getGraphPriority(graph) {
    return Number.isFinite(graph?.priority) ? graph.priority : 0;
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
    const graphs = Array.isArray(document.graphs) ? document.graphs : typeof document.graphs === 'object' ? Object.values(document.graphs) : [];
    return graphs.filter((graph) => graph?.enabled !== false);
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
        .sort((left, right) => {
            const priorityDelta = getGraphPriority(right) - getGraphPriority(left);
            if (priorityDelta !== 0) return priorityDelta;
            return stableCompare(left?.id, right?.id);
        });

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
                priority: Number.isFinite(layer?.priority) ? layer.priority : getGraphPriority(graph),
                rigId: layer?.rigId ?? graph?.rigId ?? null,
            });
        }
    }

    return layers;
}

/**
 * 🔥 CANONICAL PIPELINE ENTRY
 * This is what runFramePipeline should call
 */
export function runAnimationGraph(context) {
    const runtimeState = context?.runtimeState ?? {};
    const snapshot = {
        document: runtimeState?.document,
        runtime: runtimeState,
    };

    const layers = evaluateGraphs(snapshot, {
        time: context?.time,
        parameters: context?.input?.parameters ?? null,
    });

    // IMPORTANT: projection only — no document mutation
    return {
        ...context,
        animation: {
            layers,
        },
    };
}
