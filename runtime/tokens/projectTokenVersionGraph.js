import {
    cloneVersionEntry,
    resolveActiveVersionHead,
    topologicalOrderVersions,
    validateVersionGraph,
} from './tokenVersionGraph.js';

function createEmptyProjection() {
    return Object.freeze({
        activeHead: null,
        nodes: Object.freeze([]),
        edges: Object.freeze([]),
        branchHeads: Object.freeze([]),
        mergeNodes: Object.freeze([]),
        topoOrder: Object.freeze([]),
    });
}

function sortIdsByTopoThenId(left, right, topoIndex) {
    const leftIndex = topoIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = topoIndex.get(right) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
        return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
}

function resolveEdgeType(entry) {
    const parentCount = entry?.parentVersionIds?.length ?? 0;
    if (parentCount > 1) {
        return 'merge';
    }

    if (entry?.operation === 'fork') {
        return 'fork';
    }

    return 'linear';
}

export function projectTokenVersionGraph(tokenVersionGraph) {
    const graph = tokenVersionGraph ?? {
        entries: {},
        order: [],
        activeVersionId: null,
    };

    const validity = validateVersionGraph(graph);
    if (!validity.ok) {
        return createEmptyProjection();
    }

    const entries = graph.entries ?? {};
    const topoOrder = topologicalOrderVersions(graph);
    const topoIndex = new Map(topoOrder.map((versionId, index) => [versionId, index]));
    const childrenById = new Map(topoOrder.map((versionId) => [versionId, []]));
    const activeHead = resolveActiveVersionHead(graph);

    for (const versionId of topoOrder) {
        const entry = cloneVersionEntry(entries[versionId]);
        for (const parentId of entry.parentVersionIds) {
            const children = childrenById.get(parentId) ?? [];
            children.push(versionId);
            children.sort((left, right) => sortIdsByTopoThenId(left, right, topoIndex));
            childrenById.set(parentId, children);
        }
    }

    const branchHeads = topoOrder
        .filter((versionId) => (childrenById.get(versionId) ?? []).length === 0)
        .sort((left, right) => sortIdsByTopoThenId(left, right, topoIndex));

    const mergeNodes = topoOrder
        .filter((versionId) => (entries[versionId]?.parentVersionIds ?? []).length > 1)
        .sort((left, right) => sortIdsByTopoThenId(left, right, topoIndex));

    const nodes = topoOrder.map((versionId) => {
        const entry = cloneVersionEntry(entries[versionId]);
        return Object.freeze({
            id: versionId,
            label: entry.label ?? versionId,
            parents: Object.freeze([...entry.parentVersionIds]),
            isActive: versionId === activeHead,
            isBranchHead: branchHeads.includes(versionId),
            isMergeNode: mergeNodes.includes(versionId),
            operation: entry.operation,
            themeId: entry.themeId,
            timestamp: entry.timestamp,
        });
    });

    const edges = topoOrder
        .flatMap((versionId) => {
            const entry = cloneVersionEntry(entries[versionId]);
            const type = resolveEdgeType(entry);
            return entry.parentVersionIds.map((parentId) =>
                Object.freeze({
                    from: parentId,
                    to: versionId,
                    type,
                }),
            );
        })
        .sort((left, right) => {
            const fromOrder = left.from.localeCompare(right.from);
            if (fromOrder !== 0) {
                return fromOrder;
            }

            const toOrder = left.to.localeCompare(right.to);
            if (toOrder !== 0) {
                return toOrder;
            }

            return left.type.localeCompare(right.type);
        });

    return Object.freeze({
        activeHead,
        nodes: Object.freeze(nodes),
        edges: Object.freeze(edges),
        branchHeads: Object.freeze([...branchHeads]),
        mergeNodes: Object.freeze([...mergeNodes]),
        topoOrder: Object.freeze([...topoOrder]),
    });
}

export function hashProjectedTokenVersionGraph(projectedGraph) {
    return JSON.stringify(projectedGraph ?? createEmptyProjection());
}
