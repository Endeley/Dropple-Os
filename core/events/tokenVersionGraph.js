function normalizeStringArray(values) {
    if (!Array.isArray(values)) return [];

    return Array.from(
        new Set(
            values
                .filter((value) => typeof value === 'string')
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    ).sort((left, right) => left.localeCompare(right));
}

export function normalizeParentVersionIds(parentVersionIds) {
    return normalizeStringArray(parentVersionIds);
}

export function cloneVersionEntry(entry) {
    return {
        ...entry,
        id: entry?.id ?? null,
        label: entry?.label ?? null,
        themeId: entry?.themeId ?? null,
        timestamp: entry?.timestamp ?? null,
        operation: entry?.operation ?? 'tag',
        parentVersionIds: normalizeParentVersionIds(entry?.parentVersionIds ?? []),
    };
}

export function detectCycles(graph) {
    const entries = graph?.entries ?? {};
    const visited = new Set();
    const visiting = new Set();

    function visit(versionId) {
        if (visiting.has(versionId)) {
            return true;
        }

        if (visited.has(versionId)) {
            return false;
        }

        visited.add(versionId);
        visiting.add(versionId);

        const parents = entries[versionId]?.parentVersionIds ?? [];
        for (const parentId of parents) {
            if (!entries[parentId]) continue;
            if (visit(parentId)) {
                return true;
            }
        }

        visiting.delete(versionId);
        return false;
    }

    return Object.keys(entries).some((versionId) => visit(versionId));
}

export function isAncestorVersion(graph, ancestorId, descendantId) {
    if (!ancestorId || !descendantId) return false;
    if (ancestorId === descendantId) return true;

    const entries = graph?.entries ?? {};
    const visited = new Set();
    const stack = [...(entries[descendantId]?.parentVersionIds ?? [])];

    while (stack.length > 0) {
        const currentId = stack.pop();
        if (!currentId || visited.has(currentId)) continue;
        if (currentId === ancestorId) return true;

        visited.add(currentId);
        stack.push(...(entries[currentId]?.parentVersionIds ?? []));
    }

    return false;
}

export function validateMergeLegality(graph, parentVersionIds) {
    const parents = normalizeParentVersionIds(parentVersionIds);
    const entries = graph?.entries ?? {};

    if (parents.length < 2) {
        return { ok: false, reason: 'merge requires at least two parents' };
    }

    for (const parentId of parents) {
        if (!entries[parentId]) {
            return { ok: false, reason: `unknown merge parent: ${parentId}` };
        }
    }

    for (let index = 0; index < parents.length; index += 1) {
        for (let compareIndex = index + 1; compareIndex < parents.length; compareIndex += 1) {
            const left = parents[index];
            const right = parents[compareIndex];
            const related =
                isAncestorVersion(graph, left, right) ||
                isAncestorVersion(graph, right, left);

            if (!related) {
                return {
                    ok: false,
                    reason: `merge parents are not ancestry-compatible: ${left}, ${right}`,
                };
            }
        }
    }

    return { ok: true, parentVersionIds: parents };
}

export function validateVersionGraph(graph) {
    const entries = graph?.entries ?? {};
    const order = Array.isArray(graph?.order) ? graph.order : [];
    const activeVersionId = graph?.activeVersionId ?? null;

    for (const [versionId, entry] of Object.entries(entries)) {
        for (const parentId of entry?.parentVersionIds ?? []) {
            if (!entries[parentId]) {
                return { ok: false, reason: `orphan parent: ${versionId} -> ${parentId}` };
            }
        }
    }

    if (activeVersionId != null && !entries[activeVersionId]) {
        return { ok: false, reason: `unknown active version head: ${activeVersionId}` };
    }

    if (detectCycles(graph)) {
        return { ok: false, reason: 'cyclic version graph' };
    }

    const missingOrderEntries = Object.keys(entries).filter((versionId) => !order.includes(versionId));
    if (missingOrderEntries.length > 0) {
        return {
            ok: false,
            reason: `missing ordered versions: ${missingOrderEntries.join(', ')}`,
        };
    }

    return { ok: true };
}

export function topologicalOrderVersions(graph) {
    const entries = graph?.entries ?? {};
    const baseOrder = Array.isArray(graph?.order) ? graph.order : [];
    const orderIndex = new Map(baseOrder.map((versionId, index) => [versionId, index]));
    const indegree = new Map();
    const children = new Map();

    for (const versionId of Object.keys(entries)) {
        indegree.set(versionId, 0);
        children.set(versionId, []);
    }

    for (const [versionId, entry] of Object.entries(entries)) {
        const parents = normalizeParentVersionIds(entry?.parentVersionIds ?? []);
        indegree.set(versionId, parents.length);
        for (const parentId of parents) {
            const siblings = children.get(parentId) ?? [];
            siblings.push(versionId);
            siblings.sort((left, right) => {
                const leftIndex = orderIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
                const rightIndex = orderIndex.get(right) ?? Number.MAX_SAFE_INTEGER;
                if (leftIndex !== rightIndex) {
                    return leftIndex - rightIndex;
                }
                return left.localeCompare(right);
            });
            children.set(parentId, siblings);
        }
    }

    const queue = [...indegree.entries()]
        .filter(([, count]) => count === 0)
        .map(([versionId]) => versionId)
        .sort((left, right) => {
            const leftIndex = orderIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
            const rightIndex = orderIndex.get(right) ?? Number.MAX_SAFE_INTEGER;
            if (leftIndex !== rightIndex) {
                return leftIndex - rightIndex;
            }
            return left.localeCompare(right);
        });

    const result = [];
    while (queue.length > 0) {
        const versionId = queue.shift();
        result.push(versionId);

        for (const childId of children.get(versionId) ?? []) {
            const nextCount = (indegree.get(childId) ?? 0) - 1;
            indegree.set(childId, nextCount);
            if (nextCount === 0) {
                queue.push(childId);
                queue.sort((left, right) => {
                    const leftIndex = orderIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
                    const rightIndex = orderIndex.get(right) ?? Number.MAX_SAFE_INTEGER;
                    if (leftIndex !== rightIndex) {
                        return leftIndex - rightIndex;
                    }
                    return left.localeCompare(right);
                });
            }
        }
    }

    return result;
}

export function resolveActiveVersionHead(graph) {
    const activeVersionId = graph?.activeVersionId ?? null;
    const entries = graph?.entries ?? {};

    if (activeVersionId && entries[activeVersionId]) {
        return activeVersionId;
    }

    const ordered = topologicalOrderVersions(graph);
    return ordered[ordered.length - 1] ?? null;
}

function buildNextGraph(graph, nextEntries, nextOrder, nextActiveVersionId) {
    const nextGraph = {
        entries: nextEntries,
        order: nextOrder,
        activeVersionId: nextActiveVersionId ?? null,
    };

    return validateVersionGraph(nextGraph).ok ? nextGraph : graph;
}

export function appendTokenVersion(graphInput, entryInput) {
    const graph = graphInput ?? { entries: {}, order: [], activeVersionId: null };
    const entries = graph.entries ?? {};
    const order = Array.isArray(graph.order) ? graph.order : [];
    const entry = cloneVersionEntry(entryInput);
    const versionId = entry.id;

    if (typeof versionId !== 'string' || versionId.length === 0) {
        return graph;
    }

    if (entries[versionId]) {
        return graph;
    }

    for (const parentId of entry.parentVersionIds) {
        if (!entries[parentId]) {
            return graph;
        }
    }

    return buildNextGraph(
        graph,
        {
            ...entries,
            [versionId]: entry,
        },
        [...order, versionId],
        versionId,
    );
}

export function rollbackTokenVersion(graphInput, rollbackTargetId) {
    const graph = graphInput ?? { entries: {}, order: [], activeVersionId: null };

    if (typeof rollbackTargetId !== 'string' || rollbackTargetId.length === 0) {
        return graph;
    }

    if (!graph.entries?.[rollbackTargetId]) {
        return graph;
    }

    return buildNextGraph(
        graph,
        graph.entries ?? {},
        Array.isArray(graph.order) ? [...graph.order] : [],
        rollbackTargetId,
    );
}
