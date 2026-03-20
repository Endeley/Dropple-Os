import { nanoid } from 'nanoid';
import { EventTypes } from '../eventTypes.js';

function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

function sortById(items = []) {
    return items.slice().sort((left, right) => stableCompare(left?.id, right?.id));
}

function isObjectRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneNode(node) {
    const next = {
        ...node,
    };

    if (Array.isArray(node?.inputs)) {
        next.inputs = node.inputs.slice();
    } else if (isObjectRecord(node?.inputs)) {
        next.inputs = { ...node.inputs };
    }

    if (isObjectRecord(node?.params)) {
        next.params = { ...node.params };
    }

    if (isObjectRecord(node?.position)) {
        next.position = { ...node.position };
    }

    return next;
}

function cloneNodes(nodes) {
    if (Array.isArray(nodes)) {
        return nodes.map(cloneNode);
    }

    if (isObjectRecord(nodes)) {
        return Object.fromEntries(
            Object.entries(nodes)
                .sort(([left], [right]) => stableCompare(left, right))
                .map(([key, value]) => [key, cloneNode(value)]),
        );
    }

    return [];
}

function cloneEdges(edges) {
    return Array.isArray(edges) ? sortById(edges.map((edge) => ({ ...edge }))) : undefined;
}

function cloneGraph(graph) {
    return {
        ...graph,
        nodes: cloneNodes(graph?.nodes),
        ...(Array.isArray(graph?.edges) ? { edges: cloneEdges(graph.edges) } : {}),
        ...(isObjectRecord(graph?.parameters)
            ? { parameters: { ...graph.parameters } }
            : {}),
    };
}

function listGraphs(document) {
    if (Array.isArray(document?.graphs)) {
        return sortById(document.graphs.filter(Boolean));
    }

    if (isObjectRecord(document?.graphs)) {
        return sortById(Object.values(document.graphs).filter(Boolean));
    }

    return [];
}

function listNodes(graph) {
    if (Array.isArray(graph?.nodes)) {
        return sortById(graph.nodes.filter(Boolean));
    }

    if (isObjectRecord(graph?.nodes)) {
        return sortById(Object.values(graph.nodes).filter(Boolean));
    }

    return [];
}

function findNode(graph, nodeId) {
    return listNodes(graph).find((node) => node?.id === nodeId) ?? null;
}

function setNodes(graph, nextNodes) {
    if (Array.isArray(graph?.nodes)) {
        return {
            ...graph,
            nodes: sortById(nextNodes),
        };
    }

    const nextNodeMap = Object.fromEntries(
        sortById(nextNodes).map((node) => [node.id, node]),
    );

    return {
        ...graph,
        nodes: nextNodeMap,
    };
}

function setEdges(graph, nextEdges) {
    if (!Array.isArray(graph?.edges)) return graph;

    return {
        ...graph,
        edges: sortById(nextEdges),
    };
}

function updateGraphDocument(document, graphId, nextGraph) {
    if (Array.isArray(document?.graphs)) {
        const nextGraphs = sortById(
            document.graphs
                .filter(Boolean)
                .map((graph) => (graph?.id === graphId ? nextGraph : graph)),
        );

        return {
            ...document,
            graphs: nextGraphs,
        };
    }

    const nextGraphs = Object.fromEntries(
        Object.entries({
            ...(isObjectRecord(document?.graphs) ? document.graphs : {}),
            [graphId]: nextGraph,
        }).sort(([left], [right]) => stableCompare(left, right)),
    );

    return {
        ...document,
        graphs: nextGraphs,
    };
}

function ensureGraphState(state) {
    if (state?.document?.graphs) return state;

    return {
        ...state,
        document: {
            ...state.document,
            graphs: {},
        },
    };
}

function getGraph(document, graphId) {
    return listGraphs(document).find((graph) => graph?.id === graphId) ?? null;
}

function assertGraphExists(document, graphId) {
    const graph = getGraph(document, graphId);
    if (!graph) {
        throw new Error(`Graph not found: ${graphId}`);
    }
    return graph;
}

function assertNoDuplicateNode(graph, nodeId) {
    if (findNode(graph, nodeId)) {
        throw new Error(`Duplicate node id: ${nodeId}`);
    }
}

function assertNodeExists(graph, nodeId) {
    const node = findNode(graph, nodeId);
    if (!node) {
        throw new Error(`Graph node not found: ${nodeId}`);
    }
    return node;
}

function edgeId(from, to, input) {
    return `${from}:${to}:${input}`;
}

function isSupportedInputName(inputName) {
    if (inputName === 'input' || inputName === 'a' || inputName === 'b') {
        return true;
    }

    return /^input-(\d+)$/.test(String(inputName));
}

function getConnectionValue(node, inputName) {
    if (inputName === 'input' || inputName === 'a' || inputName === 'b') {
        return node?.[inputName] ?? null;
    }

    const arrayMatch = /^input-(\d+)$/.exec(String(inputName));
    if (arrayMatch) {
        const index = Number(arrayMatch[1]);
        return Array.isArray(node?.inputs) ? node.inputs[index] ?? null : null;
    }

    return null;
}

function upsertEdge(edges, from, to, input) {
    const id = edgeId(from, to, input);
    if (edges.some((edge) => edge?.id === id)) {
        return sortById(edges);
    }

    return sortById([
        ...edges,
        {
            id,
            from,
            to,
            input,
        },
    ]);
}

function removeEdge(edges, from, to, input) {
    return sortById(
        edges.filter(
            (edge) =>
                !(
                    edge?.from === from &&
                    edge?.to === to &&
                    edge?.input === input
                ),
        ),
    );
}

function removeEdgesForNode(edges, nodeId) {
    return sortById(
        edges.filter((edge) => edge?.from !== nodeId && edge?.to !== nodeId),
    );
}

function applyConnection(node, inputName, sourceNodeId) {
    const nextNode = cloneNode(node);

    if (inputName === 'input' || inputName === 'a' || inputName === 'b') {
        nextNode[inputName] = sourceNodeId;
        return nextNode;
    }

    const arrayMatch = /^input-(\d+)$/.exec(String(inputName));
    if (arrayMatch) {
        const index = Number(arrayMatch[1]);
        const inputs = Array.isArray(nextNode.inputs) ? nextNode.inputs.slice() : [];
        inputs[index] = sourceNodeId;
        nextNode.inputs = inputs;
        return nextNode;
    }

    nextNode[inputName] = sourceNodeId;
    return nextNode;
}

function removeConnection(node, inputName, sourceNodeId) {
    const nextNode = cloneNode(node);

    if (inputName === 'input' || inputName === 'a' || inputName === 'b') {
        if (nextNode[inputName] === sourceNodeId) {
            delete nextNode[inputName];
        }
        return nextNode;
    }

    const arrayMatch = /^input-(\d+)$/.exec(String(inputName));
    if (arrayMatch && Array.isArray(nextNode.inputs)) {
        const index = Number(arrayMatch[1]);
        if (nextNode.inputs[index] === sourceNodeId) {
            nextNode.inputs = nextNode.inputs.slice();
            nextNode.inputs[index] = null;
        }
        return nextNode;
    }

    if (nextNode[inputName] === sourceNodeId) {
        delete nextNode[inputName];
    }
    return nextNode;
}

export function graphReducers(state, event) {
    const { type, payload } = event ?? {};

    if (
        type !== EventTypes.GRAPH_NODE_ADD &&
        type !== EventTypes.GRAPH_NODE_UPDATE &&
        type !== EventTypes.GRAPH_NODE_DELETE &&
        type !== EventTypes.GRAPH_CONNECT &&
        type !== EventTypes.GRAPH_DISCONNECT &&
        type !== EventTypes.GRAPH_OUTPUT_SET &&
        type !== EventTypes.GRAPH_PARAMETER_UPDATE
    ) {
        return state;
    }

    const ensured = ensureGraphState(state);
    const graphId = payload?.graphId;
    if (!graphId) return state;

    const graph = assertGraphExists(ensured.document, graphId);

    switch (type) {
        case EventTypes.GRAPH_NODE_ADD: {
            const rawNode = payload?.node;
            if (!rawNode?.type) return state;

            const nodeId = rawNode.id || `graph-node-${nanoid()}`;
            assertNoDuplicateNode(graph, nodeId);

            const nextNode = {
                ...rawNode,
                id: nodeId,
                position: isObjectRecord(rawNode.position)
                    ? { x: Number(rawNode.position.x ?? 0), y: Number(rawNode.position.y ?? 0) }
                    : { x: 0, y: 0 },
                ...(rawNode.params ? { params: { ...rawNode.params } } : {}),
            };

            const nextGraph = setNodes(cloneGraph(graph), [
                ...listNodes(graph),
                nextNode,
            ]);

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, nextGraph),
            };
        }

        case EventTypes.GRAPH_NODE_UPDATE: {
            const nodeId = payload?.nodeId;
            const patch = payload?.patch;
            if (!nodeId || !patch) return state;

            const currentNode = assertNodeExists(graph, nodeId);
            const nextNodes = listNodes(graph).map((node) => {
                if (node.id !== nodeId) return node;

                const nextNode = {
                    ...node,
                    ...patch,
                };

                if (patch.params) {
                    nextNode.params = {
                        ...(node.params || {}),
                        ...patch.params,
                    };
                }

                if (patch.position) {
                    nextNode.position = {
                        ...(node.position || {}),
                        ...patch.position,
                    };
                }

                if (patch.inputs && Array.isArray(node.inputs)) {
                    nextNode.inputs = patch.inputs.slice();
                }

                if (patch.inputs && isObjectRecord(node.inputs)) {
                    nextNode.inputs = {
                        ...(node.inputs || {}),
                        ...patch.inputs,
                    };
                }

                return nextNode;
            });

            const nextGraph = setNodes(cloneGraph(graph), nextNodes);
            const outputChanged =
                graph?.output === currentNode.id && patch?.id && patch.id !== currentNode.id;

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, {
                    ...nextGraph,
                    ...(outputChanged ? { output: patch.id } : {}),
                }),
            };
        }

        case EventTypes.GRAPH_NODE_DELETE: {
            const nodeId = payload?.nodeId;
            if (!nodeId) return state;

            assertNodeExists(graph, nodeId);

            const nextNodes = listNodes(graph).filter((node) => node.id !== nodeId);
            let nextGraph = setNodes(cloneGraph(graph), nextNodes);

            if (Array.isArray(graph?.edges)) {
                nextGraph = setEdges(nextGraph, removeEdgesForNode(graph.edges, nodeId));
            }

            if (graph?.output === nodeId) {
                nextGraph = {
                    ...nextGraph,
                    output: nextNodes[0]?.id ?? null,
                };
            }

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, nextGraph),
            };
        }

        case EventTypes.GRAPH_CONNECT: {
            const from = payload?.from;
            const to = payload?.to;
            const input = payload?.input;
            if (!from || !to || !input) return state;
            if (from === to) {
                throw new Error('Cannot connect node to itself');
            }
            if (!isSupportedInputName(input)) {
                throw new Error(`Unsupported graph input: ${input}`);
            }

            assertNodeExists(graph, from);
            const targetNode = assertNodeExists(graph, to);
            const currentSource = getConnectionValue(targetNode, input);

            if (currentSource && currentSource !== from) {
                throw new Error(
                    `Graph input already connected: ${to}.${input} -> ${currentSource}`,
                );
            }

            const nextTarget = applyConnection(targetNode, input, from);
            let nextGraph = setNodes(
                cloneGraph(graph),
                listNodes(graph).map((node) => (node.id === to ? nextTarget : node)),
            );

            if (Array.isArray(graph?.edges)) {
                nextGraph = setEdges(nextGraph, upsertEdge(graph.edges, from, to, input));
            }

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, nextGraph),
            };
        }

        case EventTypes.GRAPH_DISCONNECT: {
            const from = payload?.from;
            const to = payload?.to;
            const input = payload?.input;
            if (!from || !to || !input) return state;
            if (!isSupportedInputName(input)) {
                throw new Error(`Unsupported graph input: ${input}`);
            }

            const targetNode = assertNodeExists(graph, to);
            const nextTarget = removeConnection(targetNode, input, from);
            let nextGraph = setNodes(
                cloneGraph(graph),
                listNodes(graph).map((node) => (node.id === to ? nextTarget : node)),
            );

            if (Array.isArray(graph?.edges)) {
                nextGraph = setEdges(nextGraph, removeEdge(graph.edges, from, to, input));
            }

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, nextGraph),
            };
        }

        case EventTypes.GRAPH_OUTPUT_SET: {
            const nodeId = payload?.nodeId;
            if (!nodeId) return state;

            assertNodeExists(graph, nodeId);

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, {
                    ...cloneGraph(graph),
                    output: nodeId,
                }),
            };
        }

        case EventTypes.GRAPH_PARAMETER_UPDATE: {
            const parameterId = payload?.parameterId ?? payload?.paramId;
            const value = payload?.value;
            if (!parameterId) return state;

            const definition = graph?.parameters?.[parameterId];
            if (!definition) {
                throw new Error(`Parameter not found: ${parameterId}`);
            }

            return {
                ...ensured,
                document: updateGraphDocument(ensured.document, graphId, {
                    ...cloneGraph(graph),
                    parameters: {
                        ...(graph.parameters || {}),
                        [parameterId]: {
                            ...definition,
                            default: value,
                        },
                    },
                }),
            };
        }

        default:
            return state;
    }
}
