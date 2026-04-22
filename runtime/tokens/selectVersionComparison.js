import { projectTokenVersionDiff } from './projectTokenVersionDiff.js';
import { isAncestorVersion, topologicalOrderVersions } from './tokenVersionGraph.js';

function createEmptyComparison(leftVersionId = null, rightVersionId = null, relationship = 'unrelated', commonAncestorId = null, leftLabel = null, rightLabel = null) {
    return Object.freeze({
        leftVersionId,
        rightVersionId,
        leftLabel,
        rightLabel,
        relationship,
        commonAncestorId,
        baseVersionId: leftVersionId,
        compareVersionId: rightVersionId,
        baseLabel: leftLabel,
        compareLabel: rightLabel,
        addedTokens: Object.freeze([]),
        removedTokens: Object.freeze([]),
        changedValues: Object.freeze([]),
        changedAliases: Object.freeze([]),
        changedThemeBindings: Object.freeze([]),
        impactSummary: Object.freeze({
            breaking: 0,
            additive: 0,
            cosmetic: 0,
        }),
    });
}

function resolveVersionLabel(graph, versionId) {
    if (!versionId) return null;
    return graph?.entries?.[versionId]?.label ?? versionId;
}

function ancestorsFor(graph, versionId) {
    const entries = graph?.entries ?? {};
    const visited = new Set();
    const stack = [versionId];

    while (stack.length > 0) {
        const currentId = stack.pop();
        if (!currentId || visited.has(currentId) || !entries[currentId]) continue;
        visited.add(currentId);
        stack.push(...(entries[currentId]?.parentVersionIds ?? []));
    }

    return visited;
}

function resolveCommonAncestor(graph, leftVersionId, rightVersionId) {
    if (!leftVersionId || !rightVersionId) return null;

    const topoOrder = topologicalOrderVersions(graph);
    const topoIndex = new Map(topoOrder.map((versionId, index) => [versionId, index]));
    const leftAncestors = ancestorsFor(graph, leftVersionId);
    const rightAncestors = ancestorsFor(graph, rightVersionId);
    const common = Array.from(leftAncestors).filter((versionId) => rightAncestors.has(versionId));

    if (common.length === 0) return null;

    common.sort((left, right) => {
        const leftIndex = topoIndex.get(left) ?? -1;
        const rightIndex = topoIndex.get(right) ?? -1;
        if (leftIndex !== rightIndex) return rightIndex - leftIndex;
        return right.localeCompare(left);
    });

    return common[0] ?? null;
}

function resolveRelationship(graph, leftVersionId, rightVersionId, commonAncestorId) {
    if (!leftVersionId || !rightVersionId) return 'unrelated';
    if (leftVersionId === rightVersionId) return 'identical';
    if (isAncestorVersion(graph, leftVersionId, rightVersionId)) return 'ancestor';
    if (isAncestorVersion(graph, rightVersionId, leftVersionId)) return 'descendant';
    if (commonAncestorId) return 'sibling_branch';
    return 'unrelated';
}

export function selectVersionComparison(state, options = {}) {
    const graph = state?.document?.tokenVersions ?? {
        entries: {},
        order: [],
        activeVersionId: null,
    };
    const leftVersionId = options?.leftVersionId ?? null;
    const rightVersionId = options?.rightVersionId ?? null;
    const leftLabel = resolveVersionLabel(graph, leftVersionId);
    const rightLabel = resolveVersionLabel(graph, rightVersionId);
    const commonAncestorId = resolveCommonAncestor(graph, leftVersionId, rightVersionId);
    const relationship = resolveRelationship(graph, leftVersionId, rightVersionId, commonAncestorId);

    if (!leftVersionId || !rightVersionId || leftVersionId === rightVersionId) {
        return createEmptyComparison(
            leftVersionId,
            rightVersionId,
            relationship,
            commonAncestorId,
            leftLabel,
            rightLabel,
        );
    }

    const diff = projectTokenVersionDiff({
        tokenVersionGraph: graph,
        document: state?.document ?? null,
        events: state?.events ?? [],
        baseVersionId: leftVersionId,
        compareVersionId: rightVersionId,
    });

    return Object.freeze({
        ...diff,
        leftVersionId,
        rightVersionId,
        leftLabel,
        rightLabel,
        relationship,
        commonAncestorId,
    });
}
