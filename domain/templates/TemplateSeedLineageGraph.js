import crypto from 'crypto';
import {
    detectCycles,
    isAncestorVersion,
    normalizeParentVersionIds,
    topologicalOrderVersions,
    validateVersionGraph,
} from '../../core/events/tokenVersionGraph.js';

const LINEAGE_NODE_TYPES = Object.freeze(['seed', 'version', 'fork', 'merge']);

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);

    if (Array.isArray(value)) {
        value.forEach((item) => deepFreeze(item));
        return value;
    }

    Object.values(value).forEach((item) => deepFreeze(item));
    return value;
}

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map((item) => stableSerialize(item));
    }

    if (value && typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }

    return value;
}

function hashObject(value) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(stableSerialize(value)))
        .digest('hex');
}

function assertNodeType(type) {
    if (!LINEAGE_NODE_TYPES.includes(type)) {
        throw new Error(
            `[Dropple Constitution] Template lineage node type "${type}" is not supported.`,
        );
    }
}

function assertContentHash(contentHash) {
    if (typeof contentHash !== 'string' || contentHash.trim().length === 0) {
        throw new Error(
            '[Dropple Constitution] Template lineage nodes require a non-empty contentHash.',
        );
    }
}

export function deriveTemplateSeedLineageNodeId({
    type,
    parentIds = [],
    contentHash,
}) {
    assertNodeType(type);
    assertContentHash(contentHash);

    return hashObject({
        type,
        parentIds: normalizeParentVersionIds(parentIds),
        contentHash,
    });
}

export function createTemplateSeedLineageNode({
    id,
    type,
    parentIds = [],
    contentHash,
}) {
    assertNodeType(type);
    assertContentHash(contentHash);

    const normalizedParentIds = normalizeParentVersionIds(parentIds);
    const derivedId = deriveTemplateSeedLineageNodeId({
        type,
        parentIds: normalizedParentIds,
        contentHash,
    });

    if (id != null && id !== derivedId) {
        throw new Error(
            `[Dropple Constitution] Template lineage node id mismatch: expected ${derivedId}, received ${id}.`,
        );
    }

    return deepFreeze({
        id: derivedId,
        type,
        parentIds: normalizedParentIds,
        contentHash,
    });
}

function buildGraphRecord(nodes) {
    const entries = {};

    for (const inputNode of nodes) {
        const node = createTemplateSeedLineageNode(inputNode ?? {});

        if (entries[node.id]) {
            throw new Error(
                `[Dropple Constitution] Duplicate template lineage node "${node.id}".`,
            );
        }

        entries[node.id] = {
            id: node.id,
            type: node.type,
            contentHash: node.contentHash,
            parentVersionIds: node.parentIds,
        };
    }

    return validateTemplateSeedLineageEntries(entries);
}

function buildChildrenIndex(graph, topoOrder) {
    const topoIndex = new Map(topoOrder.map((nodeId, index) => [nodeId, index]));
    const children = new Map(Object.keys(graph.entries).map((nodeId) => [nodeId, []]));

    for (const node of Object.values(graph.entries)) {
        for (const parentId of node.parentVersionIds) {
            const siblings = children.get(parentId) ?? [];
            siblings.push(node.id);
            siblings.sort((left, right) => {
                const leftIndex = topoIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
                const rightIndex = topoIndex.get(right) ?? Number.MAX_SAFE_INTEGER;
                if (leftIndex !== rightIndex) {
                    return leftIndex - rightIndex;
                }
                return left.localeCompare(right);
            });
            children.set(parentId, siblings);
        }
    }

    return children;
}

function toPublicNode(entry) {
    return createTemplateSeedLineageNode({
        id: entry.id,
        type: entry.type,
        parentIds: entry.parentVersionIds,
        contentHash: entry.contentHash,
    });
}

export function createTemplateSeedLineageGraph(nodes = []) {
    const graph = buildGraphRecord(Array.isArray(nodes) ? nodes : []);
    const topoOrder = topologicalOrderVersions(graph);
    const topoIndex = new Map(topoOrder.map((nodeId, index) => [nodeId, index]));
    const childrenIndex = buildChildrenIndex(graph, topoOrder);
    const publicEntries = Object.freeze(
        Object.fromEntries(
            Object.entries(graph.entries).map(([nodeId, entry]) => [nodeId, toPublicNode(entry)]),
        ),
    );

    const graphHash = hashObject({
        order: topoOrder,
        nodes: topoOrder.map((nodeId) => publicEntries[nodeId]),
    });

    function assertKnownNode(nodeId) {
        if (!publicEntries[nodeId]) {
            throw new Error(
                `[Dropple Constitution] Unknown template lineage node "${nodeId}".`,
            );
        }
    }

    const lineageGraph = {
        entries: publicEntries,
        order: Object.freeze([...topoOrder]),
        graphHash,
        getNode(nodeId) {
            return publicEntries[nodeId] ?? null;
        },
        hasNode(nodeId) {
            return Boolean(nodeId && publicEntries[nodeId]);
        },
        getParents(nodeId) {
            assertKnownNode(nodeId);
            return Object.freeze(
                publicEntries[nodeId].parentIds.map((parentId) => publicEntries[parentId]),
            );
        },
        getChildren(nodeId) {
            assertKnownNode(nodeId);
            return Object.freeze(
                [...(childrenIndex.get(nodeId) ?? [])].map((childId) => publicEntries[childId]),
            );
        },
        getTopoOrder() {
            return Object.freeze([...topoOrder]);
        },
        getAncestors(nodeId) {
            assertKnownNode(nodeId);
            return Object.freeze(
                topoOrder
                    .filter(
                        (candidateId) =>
                            candidateId !== nodeId &&
                            isAncestorVersion(graph, candidateId, nodeId),
                    )
                    .sort((left, right) => {
                        const leftIndex = topoIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
                        const rightIndex = topoIndex.get(right) ?? Number.MAX_SAFE_INTEGER;
                        if (leftIndex !== rightIndex) {
                            return leftIndex - rightIndex;
                        }
                        return left.localeCompare(right);
                    })
                    .map((ancestorId) => publicEntries[ancestorId]),
            );
        },
        validate() {
            return createTemplateSeedLineageGraph(Object.values(publicEntries));
        },
    };

    return deepFreeze(lineageGraph);
}

export function listTemplateSeedLineageNodeTypes() {
    return [...LINEAGE_NODE_TYPES];
}

export function validateTemplateSeedLineageEntries(entriesInput = {}) {
    const entries = {};

    for (const [nodeId, entry] of Object.entries(entriesInput ?? {})) {
        entries[nodeId] = {
            id: entry?.id ?? nodeId,
            type: entry?.type ?? null,
            contentHash: entry?.contentHash ?? null,
            parentVersionIds: normalizeParentVersionIds(
                entry?.parentVersionIds ?? entry?.parentIds ?? [],
            ),
        };

        if (entries[nodeId].id !== nodeId) {
            throw new Error(
                `[Dropple Constitution] Template lineage entry key/id mismatch: key=${nodeId}, value=${entries[nodeId].id}.`,
            );
        }
    }

    const order = Object.keys(entries).sort((left, right) => left.localeCompare(right));
    const graph = {
        entries,
        order,
        activeVersionId: null,
    };

    const validation = validateVersionGraph(graph);
    if (!validation.ok) {
        throw new Error(
            `[Dropple Constitution] Template seed lineage graph invalid: ${validation.reason}.`,
        );
    }

    if (detectCycles(graph)) {
        throw new Error(
            '[Dropple Constitution] Template seed lineage graph contains a cycle.',
        );
    }

    return graph;
}
